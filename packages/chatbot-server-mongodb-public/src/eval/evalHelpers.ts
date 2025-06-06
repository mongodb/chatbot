import "dotenv/config";
import { assertEnvVars } from "mongodb-chatbot-server";
import { EVAL_ENV_VARS } from "../EnvVars";
import { AzureOpenAI } from "mongodb-rag-core/openai";

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
  OPENAI_API_KEY: "",
  OPENAI_ENDPOINT: "",
  OPENAI_API_VERSION: "",
  OPENAI_RESOURCE_NAME: "",
});

export const openAiClient = new AzureOpenAI({
  apiKey: OPENAI_API_KEY,
  endpoint: OPENAI_ENDPOINT,
  apiVersion: OPENAI_API_VERSION,
});
