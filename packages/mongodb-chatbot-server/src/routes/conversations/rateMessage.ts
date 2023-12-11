import { ObjectId } from "mongodb-rag-core";
import {
  Conversation,
  ConversationsService,
} from "../../services/conversations";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from "express";
import { getRequestId, logRequest, sendErrorResponse } from "../../utils";
import { isValidIp } from "./utils";
import { z } from "zod";
import { SomeExpressRequest } from "../../middleware/validateRequestSchema";

export type RateMessageRequest = z.infer<typeof RateMessageRequest>;

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

export interface RateMessageRouteParams {
  conversations: ConversationsService;
}

export function makeRateMessageRoute({
  conversations,
}: RateMessageRouteParams) {
  return async (
    req: ExpressRequest,
    res: ExpressResponse<void>,
    next: NextFunction
  ) => {
    const reqId = getRequestId(req);
    try {
      const { ip } = req;

      if (!isValidIp(ip)) {
        return sendErrorResponse({
          reqId,
          res,
          httpStatus: 400,
          errorMessage: `Invalid IP address ${ip}`,
        });
      }

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
