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
import { AddCustomDataFunc } from "./conversationsRouter";

export type CreateConversationRequest = z.infer<
  typeof CreateConversationRequest
>;
export const CreateConversationRequest = SomeExpressRequest.extend({
  headers: z.object({
    "req-id": z.string(),
  }),
  ip: z.string(),
  origin: z.string(),
});

export interface CreateConversationRouteParams {
  conversations: ConversationsService;
  addCustomData?: AddCustomDataFunc;
}

export function makeCreateConversationRoute({
  conversations,
  addCustomData
}: CreateConversationRouteParams) {
  return async (
    req: ExpressRequest,
    res: ExpressResponse<ApiConversation>,
    next: NextFunction
  ) => {
    const reqId = getRequestId(req);
    try {
      const { ip, origin: requestOrigin } = req;

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
      try {
        const customData = addCustomData ? await addCustomData(req) : undefined;
        try {
          const conversationInDb = await conversations.create({
            ipAddress: ip as string,
            requestOrigin,
            customData,
          });
          const responseConversation =
          convertConversationFromDbToApi(conversationInDb);
          res.status(200).json(responseConversation);
          logRequest({
            reqId,
            message: `Responding with conversation ${conversationInDb._id.toString()}`,
          });
        } catch (err) {
          logRequest({reqId, message: "Error creating the conversation", type: "error"})
          sendErrorResponse({
            reqId,
            res,
            httpStatus: 500,
            errorMessage: `Error creating the conversation`,
          });
        }
      } catch(err) {
        logRequest({reqId, message: `Error parsing custom data from the request: ${err}`, type: "error"})
        sendErrorResponse({
          reqId,
          res,
          httpStatus: 500,
          errorMessage: `Error parsing custom data from the request`,
        });
      }
    } catch (err) {
      next(err);
    }
  };
}
