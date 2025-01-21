import { strict as assert } from "assert";
import { UpdateTraceFunc } from "mongodb-chatbot-server/build/routes/conversations/UpdateTraceFunc";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { extractTracingData } from "./extractTracingData";
import { LlmAsAJudge, getLlmAsAJudgeScores } from "./getLlmAsAJudgeScores";
import { OpenAI } from "mongodb-rag-core/openai";
import { makeJudgeMongoDbChatbotCommentSentiment } from "./mongoDbChatbotCommentSentiment";

export const makeAddMessageToConversationUpdateTrace: (
  k: number,
  llmAsAJudge?: LlmAsAJudge & {
    /**
    Percent of numbers to judge. Between 0 and 1.
   */
    percentToJudge: number;
  }
) => UpdateTraceFunc = (k, llmAsAJudge) => {
  validatePercentToJudge(llmAsAJudge?.percentToJudge);

  return async function ({ traceId, conversation, logger }) {
    const tracingData = extractTracingData(
      conversation.messages,
      ObjectId.createFromHexString(traceId)
    );
    const shouldJudge =
      typeof llmAsAJudge?.percentToJudge === "number" &&
      Math.random() < llmAsAJudge.percentToJudge;

    logger.updateSpan({
      id: traceId,
      tags: tracingData.tags,
      scores: {
        ...getTracingScores(tracingData, k),
        ...(shouldJudge
          ? await getLlmAsAJudgeScores(llmAsAJudge, tracingData)
          : undefined),
      },
    });
  };
};

function getTracingScores(
  tracingData: ReturnType<typeof extractTracingData>,
  k: number
) {
  return {
    RejectedQuery: tracingData.rejectQuery === true ? 1 : null,
    VerifiedAnswer: tracingData.isVerifiedAnswer === true ? 1 : null,
    LlmDoesNotKnow: tracingData.llmDoesNotKnow === true ? 1 : null,
    [`RetrievedChunksOver${k}`]:
      tracingData.isVerifiedAnswer !== true
        ? tracingData.numRetrievedChunks / k
        : null,
  };
}

export function makeRateMessageUpdateTrace(
  llmAsAJudge: LlmAsAJudge
): UpdateTraceFunc {
  return async function ({ traceId, conversation, logger }) {
    logger.updateSpan({
      id: traceId,
      scores: await getLlmAsAJudgeScores(
        llmAsAJudge,
        extractTracingData(
          conversation.messages,
          ObjectId.createFromHexString(traceId)
        )
      ),
    });
  };
}

export function makeCommentMessageUpdateTrace(
  openAiClient: OpenAI,
  judgeLlm: string
): UpdateTraceFunc {
  const judgeMongoDbChatbotCommentSentiment =
    makeJudgeMongoDbChatbotCommentSentiment(openAiClient);
  return async function ({ traceId, conversation, logger }) {
    logger.updateSpan({
      id: traceId,
      scores: {
        CommentSentiment: (
          await judgeMongoDbChatbotCommentSentiment({
            judgeLlm,
            messages: conversation.messages,
            messageWithCommentId: ObjectId.createFromHexString(traceId),
          })
        ).score,
      },
    });
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
