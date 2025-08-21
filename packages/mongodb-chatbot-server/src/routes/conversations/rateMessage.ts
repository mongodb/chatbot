import { Conversation, ConversationsService } from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from "express";
import { getRequestId, logRequest, sendErrorResponse } from "../../utils";
import { z } from "zod";
import { SomeExpressRequest } from "../../middleware/validateRequestSchema";
import {
  UpdateTraceFunc,
  updateTraceIfExists,
} from "../../processors/UpdateTraceFunc";
import { Logger } from "mongodb-rag-core/braintrust";

export type RateMessageV2Request = z.infer<typeof RateMessageV2Request>;

export const RateMessageV2Request = SomeExpressRequest.merge(
  z.object({
    headers: z.object({
      "req-id": z.string(),
    }),
    params: z.object({
      messageId: z.string(),
    }),
    body: z.object({
      rating: z.boolean(),
    }),
  })
);

export interface RateMessageRouteParams {
  conversations: ConversationsService;
  updateTrace?: UpdateTraceFunc;
  braintrustLogger?: Logger<true>;
}

export function makeRateMessageRouteV2({
  conversations,
  updateTrace,
  braintrustLogger,
}: RateMessageRouteParams) {
  return async (
    req: ExpressRequest,
    res: ExpressResponse<void>,
    next: NextFunction
  ) => {
    const reqId = getRequestId(req);
    try {
      const { messageId: messageIdStr } = req.params;
      const { rating } = req.body;
      let messageId: ObjectId;

      try {
        messageId = new ObjectId(messageIdStr);
      } catch (err) {
        return sendErrorResponse({
          reqId,
          res,
          httpStatus: 400,
          errorMessage: "Invalid message ID",
        });
      }

      let conversationInDb: Conversation | null;
      try {
        conversationInDb = await conversations.findByMessageId({
          messageId,
        });

        if (!conversationInDb) {
          throw new Error("Message not found");
        }
      } catch (err) {
        return sendErrorResponse({
          reqId,
          res,
          httpStatus: 404,
          errorMessage: "Message not found",
        });
      }

      if (
        !conversationInDb.messages.find((message) =>
          message.id.equals(messageId)
        )
      ) {
        return sendErrorResponse({
          reqId,
          res,
          httpStatus: 404,
          errorMessage: "Message not found",
        });
      }

      const successfulOperation = await conversations.rateMessage({
        conversationId: conversationInDb._id,
        messageId: messageId,
        rating,
      });

      if (successfulOperation) {
        res.sendStatus(204);
        logRequest({
          reqId,
          message: `Rated message ${messageIdStr} in conversation ${conversationInDb._id.toHexString()} with rating ${rating}`,
        });
        const traceId = messageId.toHexString();
        if (braintrustLogger) {
          braintrustLogger.logFeedback({
            id: traceId,
            scores: {
              UserRating: rating === true ? 1 : 0,
            },
          });
        }
        await updateTraceIfExists({
          updateTrace,
          reqId,
          conversations,
          conversationId: conversationInDb._id,
          assistantResponseMessageId: messageId,
        });
        return;
      } else {
        return sendErrorResponse({
          reqId,
          res,
          httpStatus: 400,
          errorMessage: "Invalid rating",
        });
      }
    } catch (err) {
      next(err);
    }
  };
}

/**
  @deprecated Use RateMessageV2Request instead.
 */
export type RateMessageRequest = z.infer<typeof RateMessageRequest>;

/**
  @deprecated Use RateMessageV2Request instead.
 */
export const RateMessageRequest = SomeExpressRequest.merge(
  z.object({
    headers: z.object({
      "req-id": z.string(),
    }),
    params: z.object({
      conversationId: z.string(),
      messageId: z.string(),
    }),
    body: z.object({
      rating: z.boolean(),
    }),
  })
);

/**
  @deprecated Use makeRateMessageRouteV2 instead.
 */
export function makeRateMessageRoute({
  conversations,
  updateTrace,
  braintrustLogger,
}: RateMessageRouteParams) {
  return async (
    req: ExpressRequest,
    res: ExpressResponse<void>,
    next: NextFunction
  ) => {
    const reqId = getRequestId(req);
    try {
      const { conversationId: conversationIdStr, messageId: messageIdStr } =
        req.params;
      const { rating } = req.body;
      let conversationId: ObjectId, messageId: ObjectId;
      try {
        conversationId = new ObjectId(conversationIdStr);
      } catch (err) {
        return sendErrorResponse({
          reqId,
          res,
          httpStatus: 400,
          errorMessage: "Invalid conversation ID",
        });
      }
      try {
        messageId = new ObjectId(messageIdStr);
      } catch (err) {
        return sendErrorResponse({
          reqId,
          res,
          httpStatus: 400,
          errorMessage: "Invalid message ID",
        });
      }

      let conversationInDb: Conversation | null;
      try {
        conversationInDb = await conversations.findById({
          _id: conversationId,
        });

        if (!conversationInDb) {
          throw new Error("Conversation not found");
        }
      } catch (err) {
        return sendErrorResponse({
          reqId,
          res,
          httpStatus: 404,
          errorMessage: "Conversation not found",
        });
      }

      if (
        !conversationInDb.messages.find((message) =>
          message.id.equals(messageId)
        )
      ) {
        return sendErrorResponse({
          reqId,
          res,
          httpStatus: 404,
          errorMessage: "Message not found",
        });
      }

      const successfulOperation = await conversations.rateMessage({
        conversationId: conversationId,
        messageId: messageId,
        rating,
      });

      if (successfulOperation) {
        res.sendStatus(204);
        logRequest({
          reqId,
          message: `Rated message ${messageIdStr} in conversation ${conversationIdStr} with rating ${rating}`,
        });
        const traceId = messageId.toHexString();
        if (braintrustLogger) {
          braintrustLogger.logFeedback({
            id: traceId,
            scores: {
              UserRating: rating === true ? 1 : 0,
            },
          });
        }
        await updateTraceIfExists({
          updateTrace,
          reqId,
          conversations,
          conversationId,
          assistantResponseMessageId: messageId,
        });
        return;
      } else {
        return sendErrorResponse({
          reqId,
          res,
          httpStatus: 400,
          errorMessage: "Invalid rating",
        });
      }
    } catch (err) {
      next(err);
    }
  };
}
