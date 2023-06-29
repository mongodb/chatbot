import { ObjectId } from "mongodb";
import {
  Conversation,
  ConversationsServiceInterface,
} from "../../services/conversations";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from "express";
import { sendErrorResponse } from "../../utils";
import { logger } from "chat-core";
import { z } from "zod";

export type RatingRequest = z.infer<typeof RatingRequest>;
export const RatingRequest = z.object({
  params: z.object({
    conversationId: z.string(),
    messageId: z.string(),
  }),
  body: z.object({
    rating: z.boolean(),
  }),
});

export interface RateMessageRouteParams {
  conversations: ConversationsServiceInterface;
}
export function makeRateMessageRoute({
  conversations,
}: RateMessageRouteParams) {
  return async (
    req: RatingRequest,
    res: ExpressResponse,
    next: NextFunction
  ) => {
    try {
      // TODO:(DOCSP-30863) implement type checking on the request

      const ipAddress = "<NOT CAPTURING IP ADDRESS YET>"; // TODO:(DOCSP-30843) refactor to get IP address with middleware

      const { conversationId: conversationIdStr, messageId: messageIdStr } =
        req.params;
      const { rating } = req.body;
      let conversationId: ObjectId, messageId: ObjectId;
      try {
        conversationId = new ObjectId(conversationIdStr);
      } catch (err) {
        return sendErrorResponse(res, 400, "Invalid conversation ID");
      }
      try {
        messageId = new ObjectId(messageIdStr);
      } catch (err) {
        return sendErrorResponse(res, 400, "Invalid message ID");
      }

      let conversationInDb: Conversation;
      try {
        conversationInDb = await conversations.findById({
          _id: conversationId,
        });
      } catch (err) {
        return sendErrorResponse(res, 404, "Conversation not found");
      }
      if (
        !conversationInDb.messages.find((message) =>
          message.id.equals(messageId)
        )
      ) {
        return sendErrorResponse(res, 404, "Message not found");
      }

      if (conversationInDb.ipAddress !== ipAddress) {
        return sendErrorResponse(
          res,
          403,
          "Invalid IP address for conversation"
        );
      }
      const successfulOperation = await conversations.rateMessage({
        conversationId: conversationId,
        messageId: messageId,
        rating,
      });

      if (successfulOperation) {
        res.sendStatus(204);
        logger.info(
          `Rated message ${messageIdStr} in conversation ${conversationIdStr} with rating ${rating}`
        );
        return;
      } else {
        return sendErrorResponse(res, 500, "Invalid rating");
      }
    } catch (err) {
      next(err);
    }
  };
}
