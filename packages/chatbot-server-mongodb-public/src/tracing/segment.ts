import { Analytics } from "@segment/analytics-node";
import { logger } from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";

export type TraceSegmentEventParams = {
  writeKey: string;
  eventName: string;
};

export type AnyEventProperties = {
  userId: string;
  anonymousId: string;
  ai_chatId: string;
  path: string;
  url: string;
};

export type TrackAnyEventParams = {
  userId: string;
  anonymousId: string;
  conversationId: ObjectId;
  origin: string;
  createdAt: Date;
};

function parseOriginUrl(origin: string | undefined) {
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

export type TrackUserSentMessageParams = TrackAnyEventParams & {
  tags: string[];
};

export type UserSentMessageEventProperties = AnyEventProperties & {
  ai_chat_tags: string;
};

export function makeTrackUserSentMessage({
  writeKey,
  eventName,
}: TraceSegmentEventParams) {
  const analytics = new Analytics({ writeKey });
  return async function trackUserSentMessage({
    userId,
    anonymousId,
    conversationId,
    origin,
    tags,
    createdAt,
  }: TrackUserSentMessageParams) {
    if (!userId || !anonymousId) {
      logger.warn(
        `Tried to track segment event "${eventName}" but missing userId and/or anonymousId`
      );
      return;
    }
    const parsedOrigin = parseOriginUrl(origin);
    if (!parsedOrigin) {
      return;
    }
    await analytics.track({
      event: eventName,
      userId,
      anonymousId,
      timestamp: createdAt?.toISOString(),
      properties: {
        userId,
        anonymousId,
        path: parsedOrigin.path,
        url: parsedOrigin.url,
        ai_chatId: conversationId.toString(),
        ai_chat_tags: tags.join(","),
      } satisfies UserSentMessageEventProperties,
    });
  };
}

export type TrackAssistantRespondedParams = TrackAnyEventParams & {
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
}: TraceSegmentEventParams) {
  const analytics = new Analytics({ writeKey });
  return async function trackAssistantResponded({
    userId,
    anonymousId,
    conversationId,
    origin,
    createdAt,
    isVerifiedAnswer,
    rejectionReason,
  }: TrackAssistantRespondedParams) {
    if (!userId || !anonymousId) {
      logger.warn(
        `Tried to track segment event "${eventName}" but missing userId and/or anonymousId`
      );
      return;
    }
    const parsedOrigin = parseOriginUrl(origin);
    if (!parsedOrigin) {
      return;
    }
    await analytics.track({
      event: eventName,
      userId,
      anonymousId,
      timestamp: createdAt?.toISOString(),
      properties: {
        userId,
        anonymousId,
        path: parsedOrigin.path,
        url: parsedOrigin.url,
        ai_chatId: conversationId.toString(),
        ai_chat_verified: isVerifiedAnswer ? "true" : "false",
        ai_chat_rejected_reason: rejectionReason,
      } satisfies AssistantRespondedProperties,
    });
  };
}

export type TrackUserRatedMessageParams = TrackAnyEventParams & {
  rating: boolean;
};

export type UserRatedMessageProperties = AnyEventProperties & {
  ai_chat_rating: "positive" | "negative";
};

export function makeTrackUserRatedMessage({
  writeKey,
  eventName,
}: TraceSegmentEventParams) {
  const analytics = new Analytics({ writeKey });
  return async function trackUserRatedMessage({
    userId,
    anonymousId,
    conversationId,
    origin,
    createdAt,
    rating,
  }: TrackUserRatedMessageParams) {
    if (!userId || !anonymousId) {
      logger.warn(
        `Tried to track segment event "${eventName}" but missing userId and/or anonymousId`
      );
      return;
    }
    const parsedOrigin = parseOriginUrl(origin);
    if (!parsedOrigin) {
      return;
    }
    await analytics.track({
      event: eventName,
      userId,
      anonymousId,
      timestamp: createdAt?.toISOString(),
      properties: {
        userId,
        anonymousId,
        path: parsedOrigin.path,
        url: parsedOrigin.url,
        ai_chatId: conversationId.toString(),
        ai_chat_rating: rating ? "positive" : "negative",
      } satisfies UserRatedMessageProperties,
    });
  };
}

export type TrackUserCommentedMessageParams = TrackAnyEventParams & {
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
}: TraceSegmentEventParams) {
  const analytics = new Analytics({ writeKey });
  return async function trackUserCommentedMessage({
    userId,
    anonymousId,
    conversationId,
    origin,
    createdAt,
    comment,
    rating,
  }: TrackUserCommentedMessageParams) {
    if (!userId || !anonymousId) {
      logger.warn(
        `Tried to track segment event "${eventName}" but missing userId and/or anonymousId`
      );
      return;
    }
    const parsedOrigin = parseOriginUrl(origin);
    if (!parsedOrigin) {
      return;
    }
    await analytics.track({
      event: eventName,
      userId,
      anonymousId,
      timestamp: createdAt?.toISOString(),
      properties: {
        userId,
        anonymousId,
        path: parsedOrigin.path,
        url: parsedOrigin.url,
        ai_chatId: conversationId.toString(),
        ai_chat_comment: comment,
        ai_chat_rating: rating ? "positive" : "negative",
      } satisfies UserCommentedMessageProperties,
    });
  };
}
