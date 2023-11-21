import {
  NextFunction,
  Response as ExpressResponse,
  Request as ExpressRequest,
} from "express";
import { z } from "zod";
import { ConversationsService } from "../../services/conversations";
import { ApiConversation, convertConversationFromDbToApi } from "./utils";
import { getRequestId, logRequest, sendErrorResponse } from "../../utils";
import { SomeExpressRequest } from "../../middleware/validateRequestSchema";
import {
  AddCustomDataFunc,
  ConversationsRouterLocals,
} from "./conversationsRouter";

export type CreateConversationRequest = z.infer<
  typeof CreateConversationRequest
>;
export const CreateConversationRequest = SomeExpressRequest.extend({
  headers: z.object({
    "req-id": z.string(),
  }),
});

export interface CreateConversationRouteParams {
  conversations: ConversationsService;
  createConversationCustomData?: AddCustomDataFunc;
}

export function makeCreateConversationRoute({
  conversations,
  createConversationCustomData,
}: CreateConversationRouteParams) {
  return async (
    req: ExpressRequest,
    res: ExpressResponse<ApiConversation, ConversationsRouterLocals>,
    next: NextFunction
  ) => {
    const reqId = getRequestId(req);
    try {
      logRequest({
        reqId,
        message: `Creating conversation`,
      });
      try {
        const customData = createConversationCustomData
          ? await createConversationCustomData(req, res)
          : undefined;
        try {
          const conversationInDb = await conversations.create({ customData });
          const responseConversation =
            convertConversationFromDbToApi(conversationInDb);
          res.status(200).json(responseConversation);
          logRequest({
            reqId,
            message: `Responding with conversation ${conversationInDb._id.toString()}`,
          });
        } catch (err) {
          logRequest({
            reqId,
            message: "Error creating the conversation",
            type: "error",
          });
          sendErrorResponse({
            reqId,
            res,
            httpStatus: 500,
            errorMessage: `Error creating the conversation`,
          });
        }
      } catch (err) {
        logRequest({
          reqId,
          message: `Error parsing custom data from the request: ${err}`,
          type: "error",
        });
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
