import {
  NextFunction,
  Response as ExpressResponse,
  Request as ExpressRequest,
} from "express";
import { ConversationsServiceInterface } from "../../services/conversations";
import { convertConversationFromDbToApi, isValidIp } from "./utils";
import { sendErrorResponse } from "../../utils";
import { logger } from "chat-core";

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
      const { ip } = req;
      // TODO:(DOCSP-30863) implement type checking on the request

      if (!isValidIp(ip)) {
        return sendErrorResponse(res, 400, `Invalid IP address ${ip}`);
      }
      logger.info(`Creating conversation for IP address: ${ip}`);

      const conversationInDb = await conversations.create({
        ipAddress: ip,
      });

      const responseConversation =
        convertConversationFromDbToApi(conversationInDb);
      res.status(200).json(responseConversation);
      logger.info(`Created conversation ${conversationInDb._id.toString()}`);
    } catch (err) {
      next(err);
    }
  };
}
