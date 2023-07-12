import {
  NextFunction,
  Response as ExpressResponse,
  Request as ExpressRequest,
} from "express";
import { z } from "zod";
import { ConversationsServiceInterface } from "../../services/conversations";
import { convertConversationFromDbToApi, isValidIp } from "./utils";
import { getRequestId, logRequest, sendErrorResponse } from "../../utils";

export type CreateConversationRequest = z.infer<
  typeof CreateConversationRequest
>;
export const CreateConversationRequest = z.object({
  headers: z.object({
    "req-id": z.string(),
  }),
  ip: z.string(),
});

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
    const reqId = getRequestId(req);
    try {
      const { ip } = req;
      // TODO:(DOCSP-30863) implement type checking on the request

      if (!isValidIp(ip)) {
        return sendErrorResponse({
          reqId,
          res,
          httpStatus: 400,
          errorMessage: `Invalid IP address ${ip}`,
        });
      }
      logRequest({
        reqId,
        message: `Creating conversation for IP address: ${ip}`,
      });

      const conversationInDb = await conversations.create({
        ipAddress: ip,
      });

      const responseConversation =
        convertConversationFromDbToApi(conversationInDb);
      res.status(200).json(responseConversation);
      logRequest({
        reqId,
        message: `Responding with conversation ${conversationInDb._id.toString()}`,
      });
    } catch (err) {
      next(err);
    }
  };
}
