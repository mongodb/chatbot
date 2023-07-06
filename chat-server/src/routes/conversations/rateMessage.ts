import { ObjectId } from "mongodb";
import { strict as assert } from "assert";
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
import { isValidIp } from "./utils";

interface RatingRequest extends ExpressRequest {
  params: {
    conversationId: string;
    messageId: string;
  };
  body: {
    rating: boolean;
  };
}
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
      const { ip } = req;
      // TODO:(DOCSP-30863) implement type checking on the request

      if (!isValidIp(ip)) {
        return sendErrorResponse(res, 400, `Invalid IP address ${ip}`);
      }

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

      let conversationInDb: Conversation | null;
      try {
        conversationInDb = await conversations.findById({
          _id: conversationId,
        });

        assert(conversationInDb);
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

      if (conversationInDb.ipAddress !== ip) {
        console.log("CONVERSATION IP::", conversationInDb.ipAddress);
        console.log("IP::", ip);
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
