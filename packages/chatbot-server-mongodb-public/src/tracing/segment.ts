import { Analytics } from "@segment/analytics-node";
import { DbMessage, logger, UserMessage } from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";

export type TraceSegmentEventParams = {
  writeKey: string;
  eventName: string;
  flushAt?: number;
};

export type AnyEventProperties = {
  userId: string;
  anonymousId: string;
  ai_chatId: string;
  path: string;
  url: string;
};

export type BaseEventParams = {
  userId: string | undefined;
  anonymousId: string | undefined;
  conversationId: ObjectId;
  origin: string;
  createdAt: Date;
};

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

function validateAndParseParams(params: BaseEventParams) {
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
  return {
    ...params,
    parsedOrigin,
  };
}

function createBaseProperties(
  params: BaseEventParams & { parsedOrigin: ParsedOrigin }
): AnyEventProperties {
  return {
    userId: params.userId,
    anonymousId: params.anonymousId,
    path: params.parsedOrigin.path,
    url: params.parsedOrigin.url,
    ai_chatId: params.conversationId.toString(),
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
  eventName,
  flushAt = 1,
}: TraceSegmentEventParams) {
  const analytics = new Analytics({ writeKey, flushAt });
  return async function trackUserSentMessage(
    params: TrackUserSentMessageParams
  ) {
    const validatedParams = validateAndParseParams(params);
    if (!validatedParams) return;

    await analytics.track({
      event: eventName,
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
  ai_chat_verified: string;
  ai_chat_rejected_reason?: string;
};

export function makeTrackAssistantResponded({
  writeKey,
  eventName,
  flushAt = 1,
}: TraceSegmentEventParams) {
  const analytics = new Analytics({ writeKey, flushAt });
  return async function trackAssistantResponded(
    params: TrackAssistantRespondedParams
  ) {
    const validatedParams = validateAndParseParams(params);
    if (!validatedParams) return;

    await analytics.track({
      event: eventName,
      userId: validatedParams.userId,
      anonymousId: validatedParams.anonymousId,
      timestamp: validatedParams.createdAt?.toISOString(),
      properties: {
        ...createBaseProperties(validatedParams),
        ai_chat_verified: params.isVerifiedAnswer ? "true" : "false",
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
  eventName,
  flushAt = 1,
}: TraceSegmentEventParams) {
  const analytics = new Analytics({ writeKey, flushAt });
  return async function trackUserRatedMessage(
    params: TrackUserRatedMessageParams
  ) {
    const validatedParams = validateAndParseParams(params);
    if (!validatedParams) return;

    await analytics.track({
      event: eventName,
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
  ai_chat_comment: string;
  ai_chat_rating: string;
};

export function makeTrackUserCommentedMessage({
  writeKey,
  eventName,
  flushAt = 1,
}: TraceSegmentEventParams) {
  const analytics = new Analytics({ writeKey, flushAt });
  return async function trackUserCommentedMessage(
    params: TrackUserCommentedMessageParams
  ) {
    const validatedParams = validateAndParseParams(params);
    if (!validatedParams) return;

    await analytics.track({
      event: eventName,
      userId: validatedParams.userId,
      anonymousId: validatedParams.anonymousId,
      timestamp: validatedParams.createdAt?.toISOString(),
      properties: {
        ...createBaseProperties(validatedParams),
        ai_chat_comment: params.comment,
        ai_chat_rating: params.rating ? "positive" : "negative",
      } satisfies UserCommentedMessageProperties,
    });
  };
}
