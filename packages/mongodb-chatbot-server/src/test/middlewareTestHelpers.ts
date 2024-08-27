import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { createRequest, createResponse } from "node-mocks-http";
import { ConversationsService } from "mongodb-rag-core";
import {
  ConversationsRouterLocals,
  ConversationsRouterResponse,
} from "../routes/conversations/conversationsRouter";

export const createConversationsMiddlewareReq = () =>
  createRequest<
    Request<
      ParamsDictionary,
      unknown,
      unknown,
      unknown,
      ConversationsRouterLocals
    >
  >();

export const createConversationsMiddlewareRes = () => {
  const res = createResponse<ConversationsRouterResponse>();
  res.locals = {
    conversations: {} as unknown as ConversationsService,
    customData: {},
  };
  return res;
};
