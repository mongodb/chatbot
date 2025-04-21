import { Analytics } from "@segment/analytics-node";
import { DbMessage, logger, UserMessage } from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { z } from "zod";

export type TraceSegmentEventParams = {
  writeKey: string;
  flushAt?: number;
};

export const AnyEventPropertiesBaseSchema = z
  .object({
    ai_chat_conversation_id: z.string(),
    path: z.string(),
    url: z.string(),
  })
  .passthrough();

export const AnyEventPropertiesSchema = z.union([
  AnyEventPropertiesBaseSchema.extend({
    userId: z.string(),
    anonymousId: z.string().optional(),
  }),
  AnyEventPropertiesBaseSchema.extend({
    userId: z.string().optional(),
    anonymousId: z.string(),
  }),
]);

export const SegmentTrackParamsBaseSchema = z.object({
  event: z.string(),
  properties: AnyEventPropertiesSchema,
  timestamp: z.union([z.string(), z.date()]),
});

export const SegmentTrackParamsSchema = z.union([
  SegmentTrackParamsBaseSchema.extend({
    userId: z.string(),
    anonymousId: z.string().optional(),
  }),
  SegmentTrackParamsBaseSchema.extend({
    userId: z.string().optional(),
    anonymousId: z.string(),
  }),
]);

export type SegmentTrackParams = z.infer<typeof SegmentTrackParamsSchema>;

export type AnyEventProperties = z.infer<typeof AnyEventPropertiesSchema>;

/**
 This is base set of params we pass to the wrapper functions that call analytics.track.
 */
const BaseTrackEventParamsSchema = z.object({
  userId: z.string().optional(),
  anonymousId: z.string().optional(),
  conversationId: z.instanceof(ObjectId),
  origin: z.string(),
  createdAt: z.date(),
});

export type BaseTrackEventParams = z.infer<typeof BaseTrackEventParamsSchema>;

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

function createBaseProperties(
  params: BaseTrackEventParams
): AnyEventProperties | null {
  const parsedOrigin = parseOriginUrl(params.origin);
  if (!parsedOrigin) {
    return null;
  }
  const result = AnyEventPropertiesSchema.safeParse({
    userId: params.userId,
    anonymousId: params.anonymousId,
    path: parsedOrigin.path,
    url: parsedOrigin.url,
    ai_chat_conversation_id: params.conversationId.toString(),
  });
  if (!result.success) {
    return null;
  }
  return result.data;
}

export const TrackUserSentMessageParamsSchema =
  BaseTrackEventParamsSchema.extend({
    tags: z.array(z.string()),
  });

export type TrackUserSentMessageParams = z.infer<
  typeof TrackUserSentMessageParamsSchema
>;

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
    const parsedParams = TrackUserSentMessageParamsSchema.safeParse(params);
    if (!parsedParams.success) {
      return;
    }

    const trackParams = SegmentTrackParamsSchema.safeParse({
      event: "AI Chat User Sent Message",
      userId: parsedParams.data.userId,
      anonymousId: parsedParams.data.anonymousId,
      timestamp: parsedParams.data.createdAt?.toISOString(),
      properties: {
        ...createBaseProperties(parsedParams.data),
        ai_chat_tags: parsedParams.data.tags.join(","),
      },
    });
    if (!trackParams.success) {
      return;
    }

    await analytics.track(trackParams.data);
  };
}

export const TrackAssistantRespondedParamsSchema =
  BaseTrackEventParamsSchema.extend({
    isVerifiedAnswer: z.boolean(),
    rejectionReason: z.string().optional(),
  });

export type TrackAssistantRespondedParams = z.infer<
  typeof TrackAssistantRespondedParamsSchema
>;

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
    const parsedParams = TrackAssistantRespondedParamsSchema.safeParse(params);
    if (!parsedParams.success) {
      return;
    }

    const trackParams = SegmentTrackParamsSchema.safeParse({
      event: "AI Chat Assistant Responded",
      userId: parsedParams.data.userId,
      anonymousId: parsedParams.data.anonymousId,
      timestamp: parsedParams.data.createdAt?.toISOString(),
      properties: {
        ...createBaseProperties(parsedParams.data),
        ai_chat_verified_answer: parsedParams.data.isVerifiedAnswer
          ? "true"
          : "false",
        ai_chat_rejected_reason: parsedParams.data.rejectionReason,
      },
    });
    if (!trackParams.success) {
      return;
    }

    await analytics.track(trackParams.data);
  };
}

export const TrackUserRatedMessageParamsSchema =
  BaseTrackEventParamsSchema.extend({
    rating: z.boolean(),
  });

export type TrackUserRatedMessageParams = z.infer<
  typeof TrackUserRatedMessageParamsSchema
>;

export function makeTrackUserRatedMessage({
  writeKey,
  flushAt = 1,
}: TraceSegmentEventParams) {
  const analytics = new Analytics({ writeKey, flushAt });
  return async function trackUserRatedMessage(
    params: TrackUserRatedMessageParams
  ) {
    const parsedParams = TrackUserRatedMessageParamsSchema.safeParse(params);
    if (!parsedParams.success) {
      return;
    }

    const trackParams = SegmentTrackParamsSchema.safeParse({
      event: "AI Chat User Rated Message",
      userId: parsedParams.data.userId,
      anonymousId: parsedParams.data.anonymousId,
      timestamp: parsedParams.data.createdAt?.toISOString(),
      properties: {
        ...createBaseProperties(parsedParams.data),
        ai_chat_rating: parsedParams.data.rating ? "positive" : "negative",
      },
    });
    if (!trackParams.success) {
      return;
    }

    await analytics.track(trackParams.data);
  };
}

export const TrackUserCommentedMessageParamsSchema =
  BaseTrackEventParamsSchema.extend({
    comment: z.string(),
    rating: z.boolean(),
  });

export type TrackUserCommentedMessageParams = z.infer<
  typeof TrackUserCommentedMessageParamsSchema
>;

export function makeTrackUserCommentedMessage({
  writeKey,
  flushAt = 1,
}: TraceSegmentEventParams) {
  const analytics = new Analytics({ writeKey, flushAt });
  return async function trackUserCommentedMessage(
    params: TrackUserCommentedMessageParams
  ) {
    const parsedParams =
      TrackUserCommentedMessageParamsSchema.safeParse(params);
    if (!parsedParams.success) {
      return;
    }

    const trackParams = SegmentTrackParamsSchema.safeParse({
      event: "AI Chat User Commented Message",
      userId: parsedParams.data.userId,
      anonymousId: parsedParams.data.anonymousId,
      timestamp: parsedParams.data.createdAt?.toISOString(),
      properties: {
        ...createBaseProperties(parsedParams.data),
        ai_chat_user_comment: parsedParams.data.comment,
        ai_chat_rating: parsedParams.data.rating ? "positive" : "negative",
      },
    });
    if (!trackParams.success) {
      return;
    }

    await analytics.track(trackParams.data);
  };
}
