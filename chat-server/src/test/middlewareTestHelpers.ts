import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { createRequest, createResponse } from "node-mocks-http";
import { ConversationsRouterLocals } from "../routes/conversations/conversationsRouter";

export const createConversationsMiddlewareReq = () =>
  createRequest<
    Request<ParamsDictionary, any, any, any, ConversationsRouterLocals>
  >();

export const createConversationsMiddlewareRes = () => {
  const res = createResponse<Response<any, ConversationsRouterLocals>>();
  res.locals = {
    conversations: {} as any,
    customData: {},
  };
  return res;
};
