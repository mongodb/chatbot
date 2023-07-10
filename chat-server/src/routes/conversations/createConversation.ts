import {
  NextFunction,
  Response as ExpressResponse,
  Request as ExpressRequest,
} from "express";
import { ConversationsServiceInterface } from "../../services/conversations";
import { convertConversationFromDbToApi, isValidIp } from "./utils";
import { logRequest, sendErrorResponse } from "../../utils";
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
        return sendErrorResponse({
          reqId: req.headers["req-id"] as string,
          res,
          httpStatus: 400,
          errorMessage: `Invalid IP address ${ip}`,
        });
      }
      logRequest({
        reqId: req.headers["req-id"] as string,
        message: `Creating conversation for IP address: ${ip}`,
      });

      const conversationInDb = await conversations.create({
        ipAddress: ip,
      });

      const responseConversation =
        convertConversationFromDbToApi(conversationInDb);
      res.status(200).json(responseConversation);
      logRequest({
        reqId: req.headers["req-id"] as string,
        message: `Responding with conversation ${conversationInDb._id.toString()}`,
      });
    } catch (err) {
      next(err);
    }
  };
}
