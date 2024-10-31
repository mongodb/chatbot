import { OpenAI } from "mongodb-rag-core";

export function chatMessage<
  T extends OpenAI.default.ChatCompletionMessageParam
>(t: T) {
  return t;
}

export const systemMessage = (
  args: Omit<OpenAI.default.ChatCompletionSystemMessageParam, "role">
): OpenAI.default.ChatCompletionSystemMessageParam =>
  chatMessage({ role: "system", ...args });

export const userMessage = (
  args: Omit<OpenAI.default.ChatCompletionUserMessageParam, "role">
): OpenAI.default.ChatCompletionUserMessageParam =>
  chatMessage({ role: "user", ...args });

export const assistantMessage = (
  args: Omit<OpenAI.default.ChatCompletionAssistantMessageParam, "role">
): OpenAI.default.ChatCompletionAssistantMessageParam =>
  chatMessage({ role: "assistant", ...args });

export * from "./makeGenerateChatCompletion";
