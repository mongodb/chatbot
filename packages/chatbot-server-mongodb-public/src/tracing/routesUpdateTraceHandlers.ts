import { strict as assert } from "assert";
import { UpdateTraceFunc } from "mongodb-chatbot-server/build/routes/conversations/UpdateTraceFunc";
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

export function makeAddMessageToConversationUpdateTrace({
  k,
  llmAsAJudge,
  segment,
}: {
  k: number;
  llmAsAJudge?: LlmAsAJudge & {
    /**
    Percent of numbers to judge. Between 0 and 1.
   */
    percentToJudge: number;
  };
  segment?: TraceSegmentEventParams;
}): UpdateTraceFunc {
  validatePercentToJudge(llmAsAJudge?.percentToJudge);

  const segmentTrackUserSentMessage = segment
    ? makeTrackUserSentMessage({
        writeKey: segment.writeKey,
        eventName: segment.eventName,
      })
    : undefined;

  const segmentTrackAssistantResponded = segment
    ? makeTrackAssistantResponded({
        writeKey: segment.writeKey,
        eventName: segment.eventName,
      })
    : undefined;

  return async function ({ traceId, conversation, logger }) {
    const tracingData = extractTracingData(
      conversation.messages,
      ObjectId.createFromHexString(traceId)
    );
    const shouldJudge =
      typeof llmAsAJudge?.percentToJudge === "number" &&
      Math.random() < llmAsAJudge.percentToJudge;

    const maybeAuthUser = conversation.customData?.authUser;
    if (maybeAuthUser && typeof maybeAuthUser === "string") {
      tracingData.tags.push(`auth_user`);
    }

    const userMessage = tracingData.userMessage;
    const { userId, anonymousId } = getSegmentIds(userMessage);
    if (userMessage) {
      segmentTrackUserSentMessage?.({
        userId,
        anonymousId,
        conversationId: conversation._id,
        origin: userMessage.customData?.origin as string,
        createdAt: userMessage.createdAt,
        tags: tracingData.tags,
      });
    }

    const assistantMessage = tracingData.assistantMessage;
    if (userMessage && assistantMessage) {
      segmentTrackAssistantResponded?.({
        userId,
        anonymousId,
        conversationId: conversation._id,
        origin: userMessage.customData?.origin as string,
        createdAt: assistantMessage.createdAt,
        isVerifiedAnswer: tracingData.isVerifiedAnswer ?? false,
        rejectionReason: tracingData.rejectQuery
          ? (assistantMessage.customData?.rejectionReason as
              | string
              | undefined) ?? "Unknown rejection reason"
          : undefined,
      });
    }

    logger.updateSpan({
      id: traceId,
      tags: tracingData.tags,
      scores: {
        ...getTracingScores(tracingData, k),
        ...(shouldJudge
          ? await getLlmAsAJudgeScores(llmAsAJudge, tracingData)
          : undefined),
      },
      metadata: {
        authUser: maybeAuthUser ?? null,
      },
    });
  };
}

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

export function makeRateMessageUpdateTrace({
  llmAsAJudge,
  segment,
}: {
  llmAsAJudge: LlmAsAJudge;
  segment?: TraceSegmentEventParams;
}): UpdateTraceFunc {
  const segmentTrackUserRatedMessage = segment
    ? makeTrackUserRatedMessage({
        writeKey: segment.writeKey,
        eventName: segment.eventName,
      })
    : undefined;

  return async function ({ traceId, conversation, logger }) {
    const tracingData = extractTracingData(
      conversation.messages,
      ObjectId.createFromHexString(traceId)
    );

    const userMessage = tracingData.userMessage;
    const assistantMessage = tracingData.assistantMessage;
    const rating = assistantMessage?.rating;
    const { userId, anonymousId } = getSegmentIds(userMessage);
    if (userMessage && assistantMessage && rating !== undefined) {
      segmentTrackUserRatedMessage?.({
        userId,
        anonymousId,
        conversationId: conversation._id,
        origin: userMessage.customData?.origin as string,
        createdAt: new Date(),
        rating,
      });
    }

    logger.updateSpan({
      id: traceId,
      scores: await getLlmAsAJudgeScores(llmAsAJudge, tracingData),
    });
  };
}

export function makeCommentMessageUpdateTrace({
  openAiClient,
  judgeLlm,
  slack,
  segment,
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
}): UpdateTraceFunc {
  const judgeMongoDbChatbotCommentSentiment =
    makeJudgeMongoDbChatbotCommentSentiment(openAiClient);

  const segmentTrackUserCommentedMessage = segment
    ? makeTrackUserCommentedMessage({
        writeKey: segment.writeKey,
        eventName: segment.eventName,
      })
    : undefined;

  return async function ({ traceId, conversation, logger }) {
    const tracingData = extractTracingData(
      conversation.messages,
      ObjectId.createFromHexString(traceId)
    );

    const userMessage = tracingData.userMessage;
    const assistantMessage = tracingData.assistantMessage;
    const rating = assistantMessage?.rating;
    const comment = assistantMessage?.userComment;
    const { userId, anonymousId } = getSegmentIds(userMessage);
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
        origin: userMessage.customData?.origin as string,
        createdAt: new Date(),
        rating,
        comment,
      });
    }

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
    if (slack !== undefined) {
      postCommentToSlack({
        slackToken: slack.token,
        slackConversationId: slack.conversationId,
        conversation,
        messageWithCommentId: ObjectId.createFromHexString(traceId),
        llmAsAJudge: slack.llmAsAJudge,
        braintrust: slack.braintrust,
      });
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
