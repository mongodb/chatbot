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
      // TODO: add processing to not just return the conversation in DB. should:
      // 1. strip out some data. see util file
      // 2. remove system prompt..maybe also in that util file?

      res.status(204).json({ conversation: conversationInDb });
    } catch (err) {
      next(err);
    }
  };
}
