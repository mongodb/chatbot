import { ObjectId } from "mongodb";
import {
  ConversationsServiceInterface,
  Message,
} from "../../services/conversations";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from "express";

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
      // TODO: implement type checking on the request

      const ipAddress = ""; // TODO: refactor to get IP address with middleware

      const { conversationId, messageId } = req.params;
      const { rating } = req.body;

      const conversationInDb = await conversations.findById({
        _id: new ObjectId(conversationId),
      });
      if (!conversationInDb) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      if (conversationInDb.ipAddress !== ipAddress) {
        return res
          .status(403)
          .json({ error: "IP address does not match conversation" });
      }
      const successfulOperation = await conversations.rateMessage({
        conversationId: new ObjectId(conversationId),
        messageId: new ObjectId(messageId),
        rating,
      });
      if (successfulOperation) {
        return res.status(204);
      } else {
        return res.status(404).json({ error: "Message not found" });
      }
    } catch (err) {
      next(err);
    }
  };
}
