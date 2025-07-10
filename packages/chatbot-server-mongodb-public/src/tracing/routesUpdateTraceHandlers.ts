import { strict as assert } from "assert";
import { UpdateTraceFunc } from "mongodb-chatbot-server";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { extractTracingData } from "./extractTracingData";
import { LlmAsAJudge, getLlmAsAJudgeScores } from "./getLlmAsAJudgeScores";
import { OpenAI } from "mongodb-rag-core/openai";
import { makeJudgeMongoDbChatbotCommentSentiment } from "./mongoDbChatbotCommentSentiment";
import { postCommentToSlack } from "./postCommentToSlack";
import {
  getSegmentIds,
  makeTrackAssistantResponded,
  makeTrackUserCommentedMessage,
  makeTrackUserRatedMessage,
  makeTrackUserSentMessage,
  TraceSegmentEventParams,
} from "./segment";
import { logRequest } from "../utils";
import { Logger } from "mongodb-rag-core/braintrust";
import { ScrubbedMessageStore } from "./scrubbedMessages/ScrubbedMessageStore";
import { ScrubbedMessage } from "./scrubbedMessages/ScrubbedMessage";
import { LanguageModel } from "mongodb-rag-core/aiSdk";
import { makeScrubbedMessagesFromTracingData } from "./scrubbedMessages/makeScrubbedMessagesFromTracingData";
import { redactPii } from "./scrubbedMessages/redactPii";
import { MessageAnalysis } from "./scrubbedMessages/analyzeMessage";
import { classifyMongoDbMetadata } from "mongodb-rag-core/mongoDbMetadata";
import { tagify } from "./tagify";

export function makeAddMessageToConversationUpdateTrace({
  k,
  llmAsAJudge,
  segment,
  braintrustLogger,
  scrubbedMessageStore,
  analyzerModel,
  embeddingModelName,
}: {
  k: number;
  llmAsAJudge?: LlmAsAJudge & {
    /**
    Percent of numbers to judge. Between 0 and 1.
   */
    percentToJudge: number;
  };
  segment?: TraceSegmentEventParams;
  braintrustLogger: Logger<true>;
  scrubbedMessageStore: ScrubbedMessageStore<MessageAnalysis>;
  analyzerModel: LanguageModel;
  embeddingModelName: string;
}): UpdateTraceFunc {
  validatePercentToJudge(llmAsAJudge?.percentToJudge);

  const segmentTrackUserSentMessage = segment
    ? makeTrackUserSentMessage({
        writeKey: segment.writeKey,
      })
    : undefined;

  const segmentTrackAssistantResponded = segment
    ? makeTrackAssistantResponded({
        writeKey: segment.writeKey,
      })
    : undefined;

  return async function ({ traceId, conversation, reqId }) {
    logRequest({
      reqId,
      message: `Updating trace for conversation ${conversation._id} (reqId: ${reqId})`,
      type: "info",
    });
    const tracingData = extractTracingData(
      conversation.messages,
      ObjectId.createFromHexString(traceId),
      conversation._id
    );
    logRequest({
      reqId,
      message: `Tracing data for conversation ${
        conversation._id
      } (reqId: ${reqId}): ${JSON.stringify(tracingData)}`,
      type: "info",
    });

    const shouldJudge =
      typeof llmAsAJudge?.percentToJudge === "number" &&
      Math.random() < llmAsAJudge.percentToJudge;

    const maybeAuthUser = conversation.customData?.authUser;
    if (maybeAuthUser && typeof maybeAuthUser === "string") {
      tracingData.tags.push(`auth_user`);
    }
    try {
      const scrubbedMessages = await makeScrubbedMessagesFromTracingData({
        tracingData,
        analysis: {
          model: analyzerModel,
        },
        embeddingModelName,
        reqId,
      });
      await scrubbedMessageStore.insertScrubbedMessages({
        messages: scrubbedMessages,
      });
    } catch (error) {
      logRequest({
        reqId,
        message: `Error scrubbing messages while adding message ${error}`,
        type: "error",
      });
    }

    // classify metadata
    try {
      const metadata = await classifyMongoDbMetadata(
        analyzerModel,
        `The following is a back and forth conversation between a user and an assistant. The user is asking a question about MongoDB. The assistant is trying to answer the user's question. The user's message is in <user_message_content> tags and the assistant's message is in <assistant_message_content> tags.
<user_message_content>
${tracingData.userMessage?.content}
</user_message_content>
<assistant_message_content>
${tracingData.assistantMessage?.content}
</assistant_message_content>`
      );
      // update tags
      for (const tag of Object.values(metadata)) {
        if (tag !== null) {
          tracingData.tags.push(tagify(tag));
        }
      }
      // Add metadata to user message
      tracingData.userMessage.metadata = {
        ...tracingData.userMessage.metadata,
        ...metadata,
      };
    } catch (error) {
      logRequest({
        reqId,
        message: `Error classifying metadata while adding message ${error}`,
        type: "error",
      });
    }

    // Send Segment events
    try {
      const userMessage = tracingData.userMessage;
      const { userId, anonymousId } = getSegmentIds(userMessage);
      const hasSegmentId = !!userId || !!anonymousId;
      if (segmentTrackUserSentMessage && hasSegmentId) {
        logRequest({
          reqId,
          message: `Sending addMessageToConversation event to Segment for conversation ${conversation._id}`,
        });

        if (userMessage) {
          segmentTrackUserSentMessage?.({
            userId,
            anonymousId,
            conversationId: conversation._id,
            origin: tracingData.origin,
            createdAt: userMessage.createdAt,
            tags: tracingData.tags,
          });
        } else {
          throw new Error(
            `Missing required data ${JSON.stringify({
              userMessage,
            })}`
          );
        }

        const assistantMessage = tracingData.assistantMessage;
        if (userMessage && assistantMessage) {
          segmentTrackAssistantResponded?.({
            userId,
            anonymousId,
            conversationId: conversation._id,
            origin: tracingData.origin,
            createdAt: assistantMessage.createdAt,
            isVerifiedAnswer: tracingData.isVerifiedAnswer ?? false,
            rejectionReason: tracingData.rejectionReason,
          });
        } else {
          throw new Error(
            `Missing required data ${JSON.stringify({
              userMessage,
              assistantMessage,
            })}`
          );
        }
      } else {
        logRequest({
          reqId,
          message: `Not sending events to Segment because no Segment configuration or ID present.`,
          type: "info",
        });
      }
    } catch (error) {
      logRequest({
        reqId,
        message: `Error sending segment event in addMessageToConversationUpdateTrace: ${error}`,
        type: "error",
      });
    }

    try {
      const judgeScores = shouldJudge
        ? await getLlmAsAJudgeScores(llmAsAJudge, tracingData).catch(
            (error) => {
              logRequest({
                reqId,
                message: `Error getting LLM as a judge scores in addMessageToConversationUpdateTrace: ${error}`,
                type: "error",
              });
              return undefined;
            }
          )
        : undefined;

      braintrustLogger.updateSpan({
        id: traceId,
        tags: tracingData.tags,
        scores: {
          ...getTracingScores(tracingData, k),
          ...(judgeScores ?? {}),
        },
        metadata: {
          authUser: maybeAuthUser ?? null,
        },
      });
    } catch (error) {
      logRequest({
        reqId,
        message: `Error updating Braintrust span in addMessageToConversationUpdateTrace: ${error}`,
        type: "error",
      });
    }
  };
}

function getTracingScores(
  tracingData: ReturnType<typeof extractTracingData>,
  k: number
) {
  return {
    // These metrics should start at 0,
    // and are updated in other update trace handlers as needed
    HasRating: tracingData.rating !== undefined ? 1 : 0,
    HasComment: tracingData.comment !== undefined ? 1 : 0,
    VerifiedAnswer: tracingData.isVerifiedAnswer === true ? 1 : 0,
    // Only calculate these metrics if the answer is not verified
    InputGuardrailPass: tracingData.isVerifiedAnswer
      ? null
      : tracingData.rejectQuery === true
      ? 0
      : 1,
    LlmAnswerAttempted: tracingData.isVerifiedAnswer
      ? null
      : tracingData.llmDoesNotKnow === true
      ? 0
      : 1,
    [`RetrievedChunksOver${k}`]: tracingData.isVerifiedAnswer
      ? null
      : tracingData.numRetrievedChunks / k,
  };
}

export function makeRateMessageUpdateTrace({
  llmAsAJudge,
  segment,
  scrubbedMessageStore,
  braintrustLogger,
}: {
  llmAsAJudge: LlmAsAJudge;
  segment?: TraceSegmentEventParams;
  scrubbedMessageStore: ScrubbedMessageStore<MessageAnalysis>;
  braintrustLogger: Logger<true>;
}): UpdateTraceFunc {
  const segmentTrackUserRatedMessage = segment
    ? makeTrackUserRatedMessage({
        writeKey: segment.writeKey,
      })
    : undefined;

  return async function ({ traceId, conversation }) {
    const tracingData = extractTracingData(
      conversation.messages,
      ObjectId.createFromHexString(traceId),
      conversation._id
    );

    const userMessage = tracingData.userMessage;
    const assistantMessage = tracingData.assistantMessage;
    const rating = assistantMessage?.rating;
    const { userId, anonymousId } = getSegmentIds(userMessage);

    // Update the scrubbed message with the rating
    try {
      assert(assistantMessage?.id, "Missing assistant message for rating");
      await scrubbedMessageStore.updateScrubbedMessage({
        id: assistantMessage.id,
        message: {
          responseRating: rating,
        },
      });

      assert(userMessage?.id, "Missing user message for rating");
      await scrubbedMessageStore.updateScrubbedMessage({
        id: userMessage.id,
        message: {
          "response.responseRating": rating,
        } as Partial<Omit<ScrubbedMessage, "_id">>,
      });
    } catch (error) {
      logRequest({
        reqId: traceId,
        message: `Error scrubbing messages during rating ${error}`,
        type: "error",
      });
    }

    try {
      const hasSegmentId = !!userId || !!anonymousId;
      if (segmentTrackUserRatedMessage && hasSegmentId) {
        logRequest({
          reqId: traceId,
          message: `Sending rateMessage event to Segment for conversation ${conversation._id}`,
        });
        if (userMessage && assistantMessage && rating !== undefined) {
          segmentTrackUserRatedMessage?.({
            userId,
            anonymousId,
            conversationId: conversation._id,
            origin: tracingData.origin,
            createdAt: new Date(),
            rating,
          });
        } else {
          throw new Error(
            `Missing required data ${JSON.stringify({
              userMessage,
              assistantMessage,
              rating,
            })}`
          );
        }
      }
    } catch (error) {
      logRequest({
        reqId: traceId,
        message: `Error sending segment event in rateMessageUpdateTrace: ${error}`,
        type: "error",
      });
    }

    try {
      braintrustLogger.updateSpan({
        id: traceId,
        scores: {
          ...(await getLlmAsAJudgeScores(llmAsAJudge, tracingData)),
          HasRating: 1,
        },
      });
    } catch (error) {
      logRequest({
        reqId: traceId,
        message: `Error updating Braintrust span in rateMessageUpdateTrace: ${error}`,
        type: "error",
      });
    }
  };
}

export function makeCommentMessageUpdateTrace({
  openAiClient,
  judgeLlm,
  slack,
  segment,
  braintrustLogger,
  scrubbedMessageStore,
}: {
  openAiClient: OpenAI;
  judgeLlm: string;
  slack?: {
    token: string;
    conversationId: string;
    llmAsAJudge: LlmAsAJudge;
    braintrust?: {
      orgName: string;
      projectName: string;
    };
  };
  segment?: TraceSegmentEventParams;
  braintrustLogger: Logger<true>;
  scrubbedMessageStore: ScrubbedMessageStore<MessageAnalysis>;
}): UpdateTraceFunc {
  const judgeMongoDbChatbotCommentSentiment =
    makeJudgeMongoDbChatbotCommentSentiment(openAiClient);

  const segmentTrackUserCommentedMessage = segment
    ? makeTrackUserCommentedMessage({
        writeKey: segment.writeKey,
      })
    : undefined;

  return async function ({ traceId, conversation }) {
    const tracingData = extractTracingData(
      conversation.messages,
      ObjectId.createFromHexString(traceId),
      conversation._id
    );

    const userMessage = tracingData.userMessage;
    const assistantMessage = tracingData.assistantMessage;
    const rating = assistantMessage?.rating;
    const comment = assistantMessage?.userComment;
    const { userId, anonymousId } = getSegmentIds(userMessage);

    // Update the scrubbed message with the comment
    try {
      const { redactedText: userComment, piiFound } = redactPii(comment ?? "");
      assert(assistantMessage?.id, "Missing assistant message for comment");
      const assistantMessageFieldsToUpdate: Record<string, unknown> = {
        userComment,
        userCommented: true,
        userCommentPii: piiFound,
      };
      // Update PII only if true.
      // This way it doesn't override it previously having been set.
      if (piiFound?.length) {
        assistantMessageFieldsToUpdate.pii = true;
      }
      await scrubbedMessageStore.updateScrubbedMessage({
        id: assistantMessage.id,
        message: assistantMessageFieldsToUpdate,
      });

      assert(userMessage?.id, "Missing user message for comment");
      await scrubbedMessageStore.updateScrubbedMessage({
        id: userMessage.id,
        message: {
          "response.userCommented": true,
          "response.userComment": userComment,
        } as Partial<Omit<ScrubbedMessage, "_id">>,
      });
    } catch (error) {
      logRequest({
        reqId: traceId,
        message: `Error scrubbing messages during comment ${error}`,
        type: "error",
      });
    }

    try {
      const hasSegmentId = !!userId || !!anonymousId;
      if (segmentTrackUserCommentedMessage && hasSegmentId) {
        logRequest({
          reqId: traceId,
          message: `Sending commentMessage event to Segment for conversation ${conversation._id}`,
        });

        if (
          userMessage &&
          assistantMessage &&
          rating !== undefined &&
          comment !== undefined
        ) {
          segmentTrackUserCommentedMessage?.({
            userId,
            anonymousId,
            conversationId: conversation._id,
            origin: tracingData.origin,
            createdAt: new Date(),
            rating,
            comment,
          });
        } else {
          throw new Error(
            `Missing required data ${JSON.stringify({
              userMessage,
              assistantMessage,
              rating,
              comment,
            })}`
          );
        }
      }
    } catch (error) {
      logRequest({
        reqId: traceId,
        message: `Error sending segment event in commentMessageUpdateTrace: ${error}`,
        type: "error",
      });
    }

    try {
      braintrustLogger.updateSpan({
        id: traceId,
        scores: {
          HasComment: 1,
          CommentSentiment: (
            await judgeMongoDbChatbotCommentSentiment({
              judgeLlm,
              messages: conversation.messages,
              messageWithCommentId: ObjectId.createFromHexString(traceId),
            })
          ).score,
        },
      });
    } catch (error) {
      logRequest({
        reqId: traceId,
        message: `Error updating Braintrust span in commentMessageUpdateTrace: ${error}`,
        type: "error",
      });
    }

    if (slack !== undefined) {
      try {
        postCommentToSlack({
          slackToken: slack.token,
          slackConversationId: slack.conversationId,
          conversation,
          messageWithCommentId: ObjectId.createFromHexString(traceId),
          llmAsAJudge: slack.llmAsAJudge,
          braintrust: slack.braintrust,
        });
      } catch (error) {
        logRequest({
          reqId: traceId,
          message: `Error posting to Slack in commentMessageUpdateTrace: ${error}`,
          type: "error",
        });
      }
    }
  };
}

function validatePercentToJudge(percentToJudge?: number) {
  if (percentToJudge !== undefined) {
    assert(
      percentToJudge >= 0 && percentToJudge <= 1,
      `percentToJudge must be between 0 and 1. Received: ${percentToJudge}`
    );
  }
}
