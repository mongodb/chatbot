import {
  NextFunction,
  Response as ExpressResponse,
  Request as ExpressRequest,
} from "express";
import { ConversationsServiceInterface } from "../../services/conversations";

export interface CreateConversationRouteParams {
  conversations: ConversationsServiceInterface;
}
export function makeCreateConversationRoute({
  conversations,
}: CreateConversationRouteParams) {
  return async function createConversation(
    req: ExpressRequest,
    res: ExpressResponse,
    next: NextFunction
  ) {
    try {
      // TODO: implement type checking on the request

      const ipAddress = "<NOT CAPTURING IP ADDRESS YET>"; // TODO: refactor to get IP address with middleware

      const conversationInDb = await conversations.create({
        ipAddress,
      });
      if (!conversationInDb) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.status(204).json({ conversation: conversationInDb });
    } catch (err) {
      next(err);
    }
  };
}
