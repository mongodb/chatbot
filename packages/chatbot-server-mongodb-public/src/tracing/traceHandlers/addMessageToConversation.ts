import { UpdateTraceFunc } from "mongodb-chatbot-server";
import { LanguageModel } from "mongodb-rag-core/aiSdk";
import { Logger } from "mongodb-rag-core/braintrust";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { classifyMongoDbMetadata } from "mongodb-rag-core/mongoDbMetadata";
import { logRequest } from "../../utils";
import { extractTracingData } from "../extractTracingData";
import { LlmAsAJudge, getLlmAsAJudgeScores } from "../getLlmAsAJudgeScores";
import { MessageAnalysis } from "../scrubbedMessages/analyzeMessage";
import { makeScrubbedMessagesFromTracingData } from "../scrubbedMessages/makeScrubbedMessagesFromTracingData";
import { ScrubbedMessageStore } from "../scrubbedMessages/ScrubbedMessageStore";
import {
  TraceSegmentEventParams,
  makeTrackUserSentMessage,
  makeTrackAssistantResponded,
  getSegmentIds,
} from "../segment";
import { tagify } from "../tagify";
import { strict as assert } from "assert";

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
    const storedMessageContent = conversation.storeMessageContent !== false;
    try {
      const scrubbedMessages = await makeScrubbedMessagesFromTracingData({
        tracingData,
        analysis: {
          model: analyzerModel,
        },
        embeddingModelName,
        reqId,
        storedMessageContent,
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

    // Short circuit if storeMessageContent=false
    if (!storedMessageContent) {
      logRequest({
        reqId,
        message: `Not performing analysis for conversation ${conversation._id} because storeMessageContent=false`,
        type: "info",
      });
      return;
    }
    console.log("made it past the return");

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

function validatePercentToJudge(percentToJudge?: number) {
  if (percentToJudge !== undefined) {
    assert(
      percentToJudge >= 0 && percentToJudge <= 1,
      `percentToJudge must be between 0 and 1. Received: ${percentToJudge}`
    );
  }
}
