import { UpdateTraceFunc } from "mongodb-chatbot-server";
import { Logger } from "mongodb-rag-core/braintrust";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { OpenAI } from "mongodb-rag-core/openai";
import { logRequest } from "../../utils";
import { extractTracingData } from "../extractTracingData";
import { LlmAsAJudge } from "../getLlmAsAJudgeScores";
import { makeJudgeMongoDbChatbotCommentSentiment } from "../mongoDbChatbotCommentSentiment";
import { postCommentToSlack } from "../postCommentToSlack";
import { MessageAnalysis } from "../scrubbedMessages/analyzeMessage";
import { redactPii } from "../scrubbedMessages/redactPii";
import { ScrubbedMessage } from "../scrubbedMessages/ScrubbedMessage";
import { ScrubbedMessageStore } from "../scrubbedMessages/ScrubbedMessageStore";
import {
  TraceSegmentEventParams,
  makeTrackUserCommentedMessage,
  getSegmentIds,
} from "../segment";
import { strict as assert } from "assert";

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
