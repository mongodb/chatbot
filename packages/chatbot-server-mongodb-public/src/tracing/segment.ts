import { Analytics } from "@segment/analytics-node";
import { DbMessage, logger, UserMessage } from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { z } from "zod";

export type TraceSegmentEventParams = {
  writeKey: string;
  flushAt?: number;
};

export type AnyEventProperties = {
  userId: string;
  anonymousId: string;
  ai_chat_conversation_id: string;
  path: string;
  url: string;
};

const BaseEventParamsSchema = z.object({
  userId: z.string().optional(),
  anonymousId: z.string().optional(),
  conversationId: z.instanceof(ObjectId),
  origin: z.string(),
  createdAt: z.date(),
});

export type BaseEventParams = z.infer<typeof BaseEventParamsSchema>;

export const ValidatedBaseEventParamsSchema =
  BaseEventParamsSchema.required().extend({
    parsedOrigin: z.object({
      path: z.string(),
      url: z.string(),
    }),
  });

export type ValidatedBaseEventParams = z.infer<
  typeof ValidatedBaseEventParamsSchema
>;

export function getSegmentIds(message: DbMessage<UserMessage> | undefined) {
  return {
    userId: message?.customData?.segmentUserId as string | undefined,
    anonymousId: message?.customData?.segmentAnonymousId as string | undefined,
  };
}

type ParsedOrigin = {
  path: string;
  url: string;
};

function parseOriginUrl(origin: string | undefined): ParsedOrigin | null {
  if (!origin) {
    return null;
  }
  try {
    const parsed = new URL(origin);
    return {
      path: parsed.pathname,
      url: origin,
    };
  } catch (error) {
    return null;
  }
}

function validateAndParseParams(
  params: Partial<BaseEventParams>
): ValidatedBaseEventParams | null {
  if (!params.userId || !params.anonymousId) {
    logger.warn(
      `Tried to track segment event but missing userId and/or anonymousId`
    );
    return null;
  }
  const parsedOrigin = parseOriginUrl(params.origin);
  if (!parsedOrigin) {
    return null;
  }
  return ValidatedBaseEventParamsSchema.required().parse({
    ...params,
    parsedOrigin,
  });
}

function createBaseProperties(
  params: ValidatedBaseEventParams
): AnyEventProperties {
  return {
    userId: params.userId,
    anonymousId: params.anonymousId,
    path: params.parsedOrigin.path,
    url: params.parsedOrigin.url,
    ai_chat_conversation_id: params.conversationId.toString(),
  };
}

export type TrackUserSentMessageParams = BaseEventParams & {
  tags: string[];
};

export type UserSentMessageEventProperties = AnyEventProperties & {
  ai_chat_tags: string;
};

export function makeTrackUserSentMessage({
  writeKey,
  flushAt = 1,
}: TraceSegmentEventParams) {
  const analytics = new Analytics({ writeKey, flushAt });
  return async function trackUserSentMessage(
    params: TrackUserSentMessageParams
  ) {
    const validatedParams = validateAndParseParams(params);
    if (!validatedParams) return;

    await analytics.track({
      event: "AI Chat User Sent Message",
      userId: validatedParams.userId,
      anonymousId: validatedParams.anonymousId,
      timestamp: validatedParams.createdAt?.toISOString(),
      properties: {
        ...createBaseProperties(validatedParams),
        ai_chat_tags: params.tags.join(","),
      } satisfies UserSentMessageEventProperties,
    });
  };
}

export type TrackAssistantRespondedParams = BaseEventParams & {
  isVerifiedAnswer: boolean;
  rejectionReason?: string;
};

export type AssistantRespondedProperties = AnyEventProperties & {
  ai_chat_verified_answer: string;
  ai_chat_rejected_reason?: string;
};

export function makeTrackAssistantResponded({
  writeKey,
  flushAt = 1,
}: TraceSegmentEventParams) {
  const analytics = new Analytics({ writeKey, flushAt });
  return async function trackAssistantResponded(
    params: TrackAssistantRespondedParams
  ) {
    const validatedParams = validateAndParseParams(params);
    if (!validatedParams) return;

    await analytics.track({
      event: "AI Chat Assistant Responded",
      userId: validatedParams.userId,
      anonymousId: validatedParams.anonymousId,
      timestamp: validatedParams.createdAt?.toISOString(),
      properties: {
        ...createBaseProperties(validatedParams),
        ai_chat_verified_answer: params.isVerifiedAnswer ? "true" : "false",
        ai_chat_rejected_reason: params.rejectionReason,
      } satisfies AssistantRespondedProperties,
    });
  };
}

export type TrackUserRatedMessageParams = BaseEventParams & {
  rating: boolean;
};

export type UserRatedMessageProperties = AnyEventProperties & {
  ai_chat_rating: "positive" | "negative";
};

export function makeTrackUserRatedMessage({
  writeKey,
  flushAt = 1,
}: TraceSegmentEventParams) {
  const analytics = new Analytics({ writeKey, flushAt });
  return async function trackUserRatedMessage(
    params: TrackUserRatedMessageParams
  ) {
    const validatedParams = validateAndParseParams(params);
    if (!validatedParams) return;

    await analytics.track({
      event: "AI Chat User Rated Message",
      userId: validatedParams.userId,
      anonymousId: validatedParams.anonymousId,
      timestamp: validatedParams.createdAt?.toISOString(),
      properties: {
        ...createBaseProperties(validatedParams),
        ai_chat_rating: params.rating ? "positive" : "negative",
      } satisfies UserRatedMessageProperties,
    });
  };
}

export type TrackUserCommentedMessageParams = BaseEventParams & {
  comment: string;
  rating: boolean;
};

export type UserCommentedMessageProperties = AnyEventProperties & {
  ai_chat_user_comment: string;
  ai_chat_rating: string;
};

export function makeTrackUserCommentedMessage({
  writeKey,
  flushAt = 1,
}: TraceSegmentEventParams) {
  const analytics = new Analytics({ writeKey, flushAt });
  return async function trackUserCommentedMessage(
    params: TrackUserCommentedMessageParams
  ) {
    const validatedParams = validateAndParseParams(params);
    if (!validatedParams) return;

    await analytics.track({
      event: "AI Chat User Commented Message",
      userId: validatedParams.userId,
      anonymousId: validatedParams.anonymousId,
      timestamp: validatedParams.createdAt?.toISOString(),
      properties: {
        ...createBaseProperties(validatedParams),
        ai_chat_user_comment: params.comment,
        ai_chat_rating: params.rating ? "positive" : "negative",
      } satisfies UserCommentedMessageProperties,
    });
  };
}
