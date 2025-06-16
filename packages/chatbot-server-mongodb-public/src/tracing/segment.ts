import { Analytics } from "@segment/analytics-node";
import { DbMessage, logger, UserMessage } from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { z } from "zod/v4";

export type TraceSegmentEventParams = {
  writeKey: string;
  flushAt?: number;
};

export const AnyEventPropertiesBaseSchema = z.looseObject({
  ai_chat_conversation_id: z.string(),
  path: z.string(),
  url: z.string(),
});

const AnyEventPropertiesParamsSchema = AnyEventPropertiesBaseSchema.extend({
  userId: z.string().optional(),
  anonymousId: z.string().optional(),
});

type AnyEventPropertiesParams = z.infer<typeof AnyEventPropertiesParamsSchema>;

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

function parseSegmentTrackParams(args: {
  params: unknown;
  functionName: string;
}) {
  const parsedTrackParams = SegmentTrackParamsSchema.safeParse(args.params);
  if (!parsedTrackParams.success) {
    throw new Error(
      `Unable to create track event params for ${
        args.functionName
      }: ${JSON.stringify({
        params: args.params,
        error: parsedTrackParams.error,
      })}`
    );
  }
  return parsedTrackParams.data;
}

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

function parseInternalTrackEventParams<
  Schema extends typeof BaseTrackEventParamsSchema
>(args: {
  params: unknown;
  schema: Schema;
  functionName: string;
}): z.infer<Schema> {
  const parsedParams = args.schema.safeParse(args.params);
  if (!parsedParams.success) {
    throw new Error(
      `Invalid params passed to ${args.functionName}: ${JSON.stringify({
        params: args.params,
        error: parsedParams.error,
      })}`
    );
  }
  return parsedParams.data;
}

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
): AnyEventPropertiesParams | null {
  const parsedOrigin = parseOriginUrl(params.origin);
  if (!parsedOrigin) {
    return null;
  }
  return AnyEventPropertiesParamsSchema.parse({
    userId: params.userId,
    anonymousId: params.anonymousId,
    path: parsedOrigin.path,
    url: parsedOrigin.url,
    ai_chat_conversation_id: params.conversationId.toString(),
  });
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
    const parsedParams = parseInternalTrackEventParams({
      params,
      schema: TrackUserSentMessageParamsSchema,
      functionName: "trackUserSentMessage",
    });
    const segmentTrackParams = parseSegmentTrackParams({
      functionName: "trackUserSentMessage",
      params: {
        event: "AI Chat User Sent Message",
        userId: parsedParams.userId,
        anonymousId: parsedParams.anonymousId,
        timestamp: parsedParams.createdAt?.toISOString(),
        properties: {
          ...createBaseProperties(parsedParams),
          ai_chat_tags: parsedParams.tags.join(","),
        },
      },
    });
    await analytics.track(segmentTrackParams);
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
    const parsedParams = parseInternalTrackEventParams({
      params,
      schema: TrackAssistantRespondedParamsSchema,
      functionName: "trackAssistantResponded",
    });

    const segmentTrackParams = parseSegmentTrackParams({
      functionName: "trackAssistantResponded",
      params: {
        event: "AI Chat Assistant Responded",
        userId: parsedParams.userId,
        anonymousId: parsedParams.anonymousId,
        timestamp: parsedParams.createdAt?.toISOString(),
        properties: {
          ...createBaseProperties(parsedParams),
          ai_chat_verified_answer: parsedParams.isVerifiedAnswer
            ? "true"
            : "false",
          ai_chat_rejected_reason: parsedParams.rejectionReason,
        },
      },
    });

    await analytics.track(segmentTrackParams);
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
    const parsedParams = parseInternalTrackEventParams({
      params,
      schema: TrackUserRatedMessageParamsSchema,
      functionName: "trackUserRatedMessage",
    });

    const segmentTrackParams = parseSegmentTrackParams({
      functionName: "trackUserRatedMessage",
      params: {
        event: "AI Chat User Rated Message",
        userId: parsedParams.userId,
        anonymousId: parsedParams.anonymousId,
        timestamp: parsedParams.createdAt?.toISOString(),
        properties: {
          ...createBaseProperties(parsedParams),
          ai_chat_rating: parsedParams.rating ? "positive" : "negative",
        },
      },
    });

    await analytics.track(segmentTrackParams);
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
    const parsedParams = parseInternalTrackEventParams({
      params,
      schema: TrackUserCommentedMessageParamsSchema,
      functionName: "trackUserCommentedMessage",
    });

    const segmentTrackParams = parseSegmentTrackParams({
      functionName: "trackUserCommentedMessage",
      params: {
        event: "AI Chat User Commented Message",
        userId: parsedParams.userId,
        anonymousId: parsedParams.anonymousId,
        timestamp: parsedParams.createdAt?.toISOString(),
        properties: {
          ...createBaseProperties(parsedParams),
          ai_chat_user_comment: parsedParams.comment,
          ai_chat_rating: parsedParams.rating ? "positive" : "negative",
        },
      },
    });

    await analytics.track(segmentTrackParams);
  };
}
