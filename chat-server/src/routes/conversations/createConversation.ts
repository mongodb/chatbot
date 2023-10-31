import {
  NextFunction,
  Response as ExpressResponse,
  Request as ExpressRequest,
} from "express";
import { z } from "zod";
import { ConversationsService } from "../../services/conversations";
import {
  ApiConversation,
  convertConversationFromDbToApi,
  isValidIp,
} from "./utils";
import { getRequestId, logRequest, sendErrorResponse } from "../../utils";
import { SomeExpressRequest } from "../../middleware/validateRequestSchema";

export type CreateConversationRequest = z.infer<
  typeof CreateConversationRequest
>;
export const CreateConversationRequest = SomeExpressRequest.merge(
  z.object({
    headers: z.object({
      "req-id": z.string(),
      origin: z.string(),
    }),
    ip: z.string(),
  })
);

export interface CreateConversationRouteParams {
  conversations: ConversationsService;
}

export function makeCreateConversationRoute({
  conversations,
}: CreateConversationRouteParams) {
  return async (
    req: ExpressRequest,
    res: ExpressResponse<ApiConversation>,
    next: NextFunction
  ) => {
    const reqId = getRequestId(req);
    try {
      const {
        headers: { origin: requestOrigin },
        ip
      } = req;

      if (!requestOrigin) {
        return sendErrorResponse({
          reqId,
          res,
          httpStatus: 400,
          errorMessage: "Origin header not present",
        });
      }

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
        requestOrigin,
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
