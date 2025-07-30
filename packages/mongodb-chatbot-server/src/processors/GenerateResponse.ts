import {
  ConversationCustomData,
  DataStreamer,
  Conversation,
  SomeMessage,
  AssistantMessage,
  UserMessage,
} from "mongodb-rag-core";
import type { OpenAI } from "mongodb-rag-core/openai";

export type ClientContext = Record<string, unknown>;

export interface GenerateResponseParams {
  shouldStream: boolean;
  latestMessageText: string;
  clientContext?: ClientContext;
  customData?: ConversationCustomData;
  dataStreamer?: DataStreamer;
  reqId: string;
  conversation: Conversation;
  customSystemPrompt?: string;
  toolDefinitions?: OpenAI.FunctionDefinition[];
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
