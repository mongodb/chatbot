import {
  NextFunction,
  Response as ExpressResponse,
  Request as ExpressRequest,
} from "express";
import { z } from "zod";
import { getRequestId, logRequest, sendErrorResponse } from "../../utils";
import { SomeExpressRequest } from "../../middleware/validateRequestSchema";
import { ConversationForApi, isValidIp } from "../utils";
import { ApiConversationsService } from "../../services/ApiConversations";
import { convertApiConversationFromDbToApi } from "./utils";

export type CreateApiConversationRequestBody = z.infer<
  typeof CreateApiConversationRequestBody
>;
export const CreateApiConversationRequestBody = z.object({
  projectId: z.string(),
  groupId: z.string(),
});

export type CreateApiConversationRequest = z.infer<
  typeof CreateApiConversationRequest
>;
export const CreateApiConversationRequest = SomeExpressRequest.merge(
  z.object({
    headers: z.object({
      "req-id": z.string(),
    }),
    ip: z.string(),
    body: CreateApiConversationRequestBody,
  })
);

export interface CreateApiConversationRouteParams {
  apiConversations: ApiConversationsService;
}

export function makeCreateApiConversationRoute({
  apiConversations,
}: CreateApiConversationRouteParams) {
  return async (
    req: ExpressRequest,
    res: ExpressResponse<ConversationForApi>,
    next: NextFunction
  ) => {
    const reqId = getRequestId(req);
    try {
      const { ip } = req;

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

      const conversationInDb = await apiConversations.create({
        ipAddress: ip ?? "::1",
      });

      const responseConversation =
        convertApiConversationFromDbToApi(conversationInDb);
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
