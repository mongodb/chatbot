import {
  NextFunction,
  Response as ExpressResponse,
  Request as ExpressRequest,
} from "express";
import { ConversationsServiceInterface } from "../../services/conversations";
import { convertConversationFromDbToApi } from "./utils";
import { logger } from "../../services/logger";

export interface CreateConversationRouteParams {
  conversations: ConversationsServiceInterface;
}
export function makeCreateConversationRoute({
  conversations,
}: CreateConversationRouteParams) {
  return async (
    req: ExpressRequest,
    res: ExpressResponse,
    next: NextFunction
  ) => {
    try {
      // TODO: implement type checking on the request
      const ipAddress = "<NOT CAPTURING IP ADDRESS YET>"; // TODO: refactor to get IP address with middleware
      logger.info(`Creating conversation for IP address ${ipAddress}`);

      const conversationInDb = await conversations.create({
        ipAddress,
      });

      const responseConversation =
        convertConversationFromDbToApi(conversationInDb);
      res.status(200).json({ conversation: responseConversation });
      logger.info(`Created conversation ${conversationInDb._id.toString()}`);
    } catch (err) {
      next(err);
    }
  };
}
