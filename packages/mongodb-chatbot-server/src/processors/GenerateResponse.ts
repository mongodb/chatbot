import {
  ConversationCustomData,
  DataStreamer,
  Conversation,
  SomeMessage,
  AssistantMessage,
  UserMessage,
} from "mongodb-rag-core";

export type ClientContext = Record<string, unknown>;

export interface GenerateResponseParams {
  shouldStream: boolean;
  latestMessageText: string;
  clientContext?: ClientContext;
  customData?: ConversationCustomData;
  dataStreamer?: DataStreamer;
  reqId: string;
  conversation: Conversation;
}

export interface GenerateResponseReturnValue {
  /**
    Input user message, ...any tool calls, output assistant message
   */
  messages: [UserMessage, ...SomeMessage[], AssistantMessage];
}

export type GenerateResponse = (
  params: GenerateResponseParams
) => Promise<GenerateResponseReturnValue>;
