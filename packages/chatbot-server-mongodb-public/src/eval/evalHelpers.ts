import "dotenv/config";
import {
  assertEnvVars,
  AssistantMessage,
  SomeMessage,
  UserMessage,
} from "mongodb-chatbot-server";
import { AZURE_OPENAI_ENV_VARS, EVAL_ENV_VARS } from "../EnvVars";
import { AzureOpenAI } from "mongodb-rag-core/openai";
import { strict as assert } from "assert";
import { wrapOpenAI } from "mongodb-rag-core/braintrust";
import { createAzure } from "mongodb-rag-core/aiSdk";

export const {
  JUDGE_EMBEDDING_MODEL,
  JUDGE_LLM,
  OPENAI_API_KEY,
  OPENAI_PREPROCESSOR_CHAT_COMPLETION_DEPLOYMENT,
  OPENAI_ENDPOINT,
  OPENAI_API_VERSION,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  OPENAI_RESOURCE_NAME,
} = assertEnvVars({
  ...EVAL_ENV_VARS,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT: "",
  OPENAI_PREPROCESSOR_CHAT_COMPLETION_DEPLOYMENT: "",
  ...AZURE_OPENAI_ENV_VARS,
  OPENAI_API_KEY: "",
  OPENAI_ENDPOINT: "",
  OPENAI_API_VERSION: "",
});

export const openAiClient = wrapOpenAI(
  new AzureOpenAI({
    apiKey: OPENAI_API_KEY,
    endpoint: OPENAI_ENDPOINT,
    apiVersion: OPENAI_API_VERSION,
  })
);

export const azureOpenAiProvider = createAzure({
  apiKey: OPENAI_API_KEY,
  resourceName: OPENAI_RESOURCE_NAME,
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
  const contexts =
    userMessage.contextContent
      ?.map((cc) => cc.text)
      .filter((text) => typeof text === "string") ?? [];
  const urls =
    userMessage.contextContent
      ?.map((cc) => cc.url)
      .filter((text) => typeof text === "string") ?? [];
  return { contexts, urls };
}
