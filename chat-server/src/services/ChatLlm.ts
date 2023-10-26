/**
 * @fileoverview This file contains the interfaces for the LLM service.
 * Note that the LLM service is based on the OpenAI API, so the interface borrow
 * from that. This interface could still work with non OpenAI providers if they
 * implement the same interface.
 */
import { ChatMessage, ChatCompletions } from "@azure/openai";
import {
  PersistedFunctionDefinition,
  PersistedHttpRequestFunctionDefinition,
} from "./PersistedFunctionDefinition";
export type OpenAiMessageRole = "system" | "assistant" | "user" | "function";

export interface OpenAiChatMessage extends ChatMessage {
  /** The role of the message in the context of the conversation. */
  role: OpenAiMessageRole;
  /** Response to user's chat message in the context of the conversation. */
  content: string | null;

  /**
    The vector representation of the content.
   */
  embedding?: number[];

  /**
    Available function definitions for the next chat message.
   */
  functions?: (
    | PersistedFunctionDefinition
    | PersistedHttpRequestFunctionDefinition
  )[];
}

export type SystemPrompt = OpenAiChatMessage & { role: "system" };

export interface LlmAnswerQuestionParams {
  messages: OpenAiChatMessage[];
  chunks: string[];
}

export type OpenAIChatCompletionWithoutUsage = Omit<ChatCompletions, "usage">;

export type OpenAiStreamingResponse =
  AsyncIterable<OpenAIChatCompletionWithoutUsage>;
export type OpenAiAwaitedResponse = OpenAiChatMessage;

/**
  LLM that responds to user queries. Provides both streaming and awaited options.
 */
export interface ChatLlm {
  answerQuestionStream({
    messages,
    chunks,
  }: LlmAnswerQuestionParams): Promise<OpenAiStreamingResponse>;
  answerQuestionAwaited({
    messages,
    chunks,
  }: LlmAnswerQuestionParams): Promise<OpenAiAwaitedResponse>;
}
