/**
 * @fileoverview This file contains the interfaces for the LLM service.
 * Note that the LLM service is based on the OpenAI API, so the interface borrow
 * from that. This interface could still work with non OpenAI providers if they
 * implement the same interface.
 */
import {
  ChatCompletions,
  ChatRequestMessage,
  FunctionDefinition,
} from "@azure/openai";
export type OpenAiMessageRole = "system" | "assistant" | "user" | "function";

export type OpenAiChatMessage = ChatRequestMessage & {
  /** The role of the message in the context of the conversation. */
  role: OpenAiMessageRole;

  /**
    The vector representation of the content.
   */
  embedding?: number[];

  content: string;
};

export type SystemPrompt = OpenAiChatMessage & { role: "system" };

export interface LlmAnswerQuestionParams {
  messages: OpenAiChatMessage[];
  chunks: string[];
}
/**
  Tool for the chatbot to use.
 */
export interface Tool {
  /**
      Function definition for the LLM to invoke.
     */
  definition: FunctionDefinition;

  /**
      Call the function based on the arguments in the {@link Tool.definition}.
     */
  call(args: unknown): Promise<OpenAiChatMessage>;
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
  callTool?(message: OpenAiChatMessage): Promise<OpenAiChatMessage>;
}
