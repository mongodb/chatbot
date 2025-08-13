import { UpdateTraceFunc } from "mongodb-chatbot-server";
import { Logger } from "mongodb-rag-core/braintrust";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { logRequest } from "../../utils";
import { extractTracingData } from "../extractTracingData";
import { LlmAsAJudge, getLlmAsAJudgeScores } from "../getLlmAsAJudgeScores";
import { MessageAnalysis } from "../scrubbedMessages/analyzeMessage";
import { ScrubbedMessage } from "../scrubbedMessages/ScrubbedMessage";
import { ScrubbedMessageStore } from "../scrubbedMessages/ScrubbedMessageStore";
import { strict as assert } from "assert";
import {
  TraceSegmentEventParams,
  makeTrackUserRatedMessage,
  getSegmentIds,
} from "../segment";

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
