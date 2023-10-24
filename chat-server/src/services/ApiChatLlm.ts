import { FunctionDefinition, GetChatCompletionsOptions } from "@azure/openai";
import { OpenAiChatMessage } from "./ChatLlm";
import { LlmFunction } from "./LlmFunction";

export interface ApiChatLlmAnswerAwaitedParams {
  query: string;
  messages: OpenAiChatMessage[];
  availableFunctions: LlmFunction[];
  options: GetChatCompletionsOptions;
}
/**
  LLM service to interact with HTTP API.
 */
export interface ApiChatLlm {
  answerAwaited(params: ApiChatLlmAnswerAwaitedParams): Promise<{
    newMessages: OpenAiChatMessage[];
    availableFunctionDefinitions: FunctionDefinition[];
  }>;
}
