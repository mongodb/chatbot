import { ConversationsService } from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import { getRequestId, logRequest, sendErrorResponse } from "../../utils";
import {
  ApiConversation,
  RequestError,
  convertConversationFromDbToApi,
  makeRequestError,
} from "./utils";
import { z } from "zod";
import { SomeExpressRequest } from "../../middleware/validateRequestSchema";

export type GetConversationRequest = z.infer<typeof GetConversationRequest>;

export const GetConversationRequest = SomeExpressRequest.merge(
  z.object({
    headers: z.object({
      "req-id": z.string(),
    }),
    params: z.object({
      conversationId: z.string(),
    }),
  })
);

export interface GetConversationRouteParams {
  conversations: ConversationsService;
}

export function makeGetConversationRoute({
  conversations,
}: GetConversationRouteParams) {
  return async (req: ExpressRequest, res: ExpressResponse<ApiConversation>) => {
    const reqId = getRequestId(req);
    try {
      const { conversationId: conversationIdStr } = req.params;
      if (!conversationIdStr || !ObjectId.isValid(conversationIdStr)) {
        throw makeRequestError({
          httpStatus: 400,
          message: "Invalid conversation ID",
        });
      }
      const conversationId = new ObjectId(conversationIdStr);

      const conversationInDb = await conversations.findById({
        _id: conversationId,
      });

      if (!conversationInDb) {
        throw makeRequestError({
          message: "Conversation not found",
          httpStatus: 404,
        });
      }
      const apiConversation = convertConversationFromDbToApi(conversationInDb);
      logRequest({
        reqId,
        message: `Successfully retrieved conversation: ${apiConversation}`,
      });
      return res.status(200).json(apiConversation);
    } catch (error) {
      const { httpStatus, message } =
        (error as Error).name === "RequestError"
          ? (error as RequestError)
          : makeRequestError({
              message: (error as Error).message,
              stack: (error as Error).stack,
              httpStatus: 500,
            });

      return sendErrorResponse({
        res,
        reqId,
        httpStatus,
        errorMessage: message,
      });
    }
  };
}
