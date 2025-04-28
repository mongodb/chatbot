import {
  SomeMessage,
  DataStreamer,
  Conversation,
  ConversationCustomData,
} from "mongodb-rag-core";
import { Request as ExpressRequest } from "express";

export type ClientContext = Record<string, unknown>;

export interface GenerateResponseParams {
  shouldStream: boolean;
  latestMessageText: string;
  clientContext?: ClientContext;
  customData?: ConversationCustomData;
  dataStreamer?: DataStreamer;
  reqId: string;
  conversation: Conversation;
  request?: ExpressRequest;
}

export interface GenerateResponseReturnValue {
  messages: SomeMessage[];
}

export type GenerateResponse = (
  params: GenerateResponseParams
) => Promise<GenerateResponseReturnValue>;
