import {
  assertEnvVars,
  AssistantMessage,
  SomeMessage,
  UserMessage,
} from "mongodb-chatbot-server";
import { EVAL_ENV_VARS } from "../EvalEnvVars";
import { AzureOpenAI } from "openai";
import { z } from "zod";
import { strict as assert } from "assert";

export const {
  JUDGE_EMBEDDING_MODEL,
  JUDGE_LLM,
  OPENAI_API_KEY,
  OPENAI_PREPROCESSOR_CHAT_COMPLETION_DEPLOYMENT,
  OPENAI_ENDPOINT,
  OPENAI_API_VERSION,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
} = assertEnvVars({
  ...EVAL_ENV_VARS,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT: "",
  OPENAI_PREPROCESSOR_CHAT_COMPLETION_DEPLOYMENT: "",
  OPENAI_API_KEY: "",
  OPENAI_ENDPOINT: "",
  OPENAI_API_VERSION: "",
});

export const openAiClient = new AzureOpenAI({
  apiKey: OPENAI_API_KEY,
  endpoint: OPENAI_ENDPOINT,
  apiVersion: OPENAI_API_VERSION,
});

export function getLastUserMessageFromMessages(
  messages: SomeMessage[]
): UserMessage {
  const userMessage = [...messages].reverse().find((m) => m.role === "user");
  assert(userMessage, "Conversation must have a UserMessage");
  return userMessage as UserMessage;
}
export function getLastAssistantMessageFromMessages(
  messages: SomeMessage[]
): AssistantMessage {
  const assistantMessage = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");
  assert(assistantMessage, "Conversation must have a AssistantMessage");
  return assistantMessage as AssistantMessage;
}

export function getContextsFromUserMessage(userMessage: UserMessage) {
  const { data: contexts } = z
    .array(z.string())
    .safeParse(userMessage.contextContent?.map((cc) => cc.text));
  // Return empty array if no context text found
  return contexts ?? [];
}
