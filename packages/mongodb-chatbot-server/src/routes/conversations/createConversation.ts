import {
  Response as ExpressResponse,
  Request as ExpressRequest,
} from "express";
import { z } from "zod";
import {
  ConversationCustomData,
  ConversationsService,
  SystemMessage,
} from "mongodb-rag-core";
import {
  ApiConversation,
  convertConversationFromDbToApi,
  makeRequestError,
  RequestError,
} from "./utils";
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
  systemPrompt: SystemMessage;
}

export function makeCreateConversationRoute({
  conversations,
  createConversationCustomData,
  systemPrompt,
}: CreateConversationRouteParams) {
  return async (
    req: ExpressRequest,
    res: ExpressResponse<ApiConversation, ConversationsRouterLocals>
  ) => {
    const reqId = getRequestId(req);
    try {
      logRequest({
        reqId,
        message: `Creating conversation`,
      });
      const customData = await getCustomData(
        req,
        res,
        createConversationCustomData
      );
      const conversationInDb = await conversations.create({
        customData,
        initialMessages: [systemPrompt],
      });
      const responseConversation =
        convertConversationFromDbToApi(conversationInDb);
      res.status(200).json(responseConversation);
      logRequest({
        reqId,
        message: `Responding with conversation ${conversationInDb._id.toString()}`,
      });
    } catch (error) {
      const { httpStatus, message } =
        (error as Error).name === "RequestError"
          ? (error as RequestError)
          : makeRequestError({
              message: (error as Error).message,
              stack: (error as Error).stack,
              httpStatus: 500,
            });

      sendErrorResponse({
        res,
        reqId,
        httpStatus,
        errorMessage: message,
      });
    }
  };
}

async function getCustomData(
  req: ExpressRequest,
  res: ExpressResponse<ApiConversation, ConversationsRouterLocals>,
  createConversationCustomData?: AddCustomDataFunc
): Promise<ConversationCustomData | undefined> {
  try {
    if (createConversationCustomData) {
      return await createConversationCustomData(req, res);
    }
  } catch (error) {
    throw makeRequestError({
      message: "Error parsing custom data from the request",
      stack: (error as Error).stack,
      httpStatus: 500,
    });
  }
}
