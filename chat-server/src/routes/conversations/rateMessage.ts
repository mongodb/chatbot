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
import { logRequest, sendErrorResponse } from "../../utils";
import { logger } from "chat-core";
import { areEquivalentIpAddresses, isValidIp } from "./utils";

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
        return sendErrorResponse({
          reqId: req.headers["req-id"] as string,
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
          reqId: req.headers["req-id"] as string,
          res,
          httpStatus: 400,
          errorMessage: "Invalid conversation ID",
        });
      }
      try {
        messageId = new ObjectId(messageIdStr);
      } catch (err) {
        return sendErrorResponse({
          reqId: req.headers["req-id"] as string,
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

        assert(conversationInDb);
      } catch (err) {
        return sendErrorResponse({
          reqId: req.headers["req-id"] as string,
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
          reqId: req.headers["req-id"] as string,
          res,
          httpStatus: 404,
          errorMessage: "Message not found",
        });
      }

      if (!areEquivalentIpAddresses(conversationInDb.ipAddress, ip)) {
        return sendErrorResponse({
          reqId: req.headers["req-id"] as string,
          res,
          httpStatus: 403,
          errorMessage: "Invalid IP address for conversation",
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
          reqId: req.headers["req-id"] as string,
          message: `Rated message ${messageIdStr} in conversation ${conversationIdStr} with rating ${rating}`,
        });
        return;
      } else {
        return sendErrorResponse({
          reqId: req.headers["req-id"] as string,
          res,
          httpStatus: 500,
          errorMessage: "Invalid rating",
        });
      }
    } catch (err) {
      next(err);
    }
  };
}
