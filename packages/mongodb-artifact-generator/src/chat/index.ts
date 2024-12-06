import { OpenAI } from "mongodb-rag-core/openai";

export function chatMessage<T extends OpenAI.ChatCompletionMessageParam>(t: T) {
  return t;
}

export const systemMessage = (
  args: Omit<OpenAI.ChatCompletionSystemMessageParam, "role">
): OpenAI.ChatCompletionSystemMessageParam =>
  chatMessage({ role: "system", ...args });

export const userMessage = (
  args: Omit<OpenAI.ChatCompletionUserMessageParam, "role">
): OpenAI.ChatCompletionUserMessageParam =>
  chatMessage({ role: "user", ...args });

export const assistantMessage = (
  args: Omit<OpenAI.ChatCompletionAssistantMessageParam, "role">
): OpenAI.ChatCompletionAssistantMessageParam =>
  chatMessage({ role: "assistant", ...args });

export * from "./makeGenerateChatCompletion";
