import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { createRequest, createResponse } from "node-mocks-http";
import { ConversationsService } from "mongodb-rag-core";
import {
  ConversationsRouterLocals,
  ConversationsRouterResponse,
} from "mongodb-chatbot-server";

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

export function caseInsensitiveHeaders(headers: Record<string, string>) {
  // Express automatically converts all headers to lowercase but
  // node-mocks-http does not. This function is a workaround for that.
  return Object.entries(headers).reduce((acc, [key, value]) => {
    acc[key.toLowerCase()] = value;
    return acc;
  }, {} as Record<string, string>);
}
