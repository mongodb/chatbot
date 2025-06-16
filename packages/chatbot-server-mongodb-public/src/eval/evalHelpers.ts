import "dotenv/config";
import { assertEnvVars } from "mongodb-chatbot-server";
import { AZURE_OPENAI_ENV_VARS, EVAL_ENV_VARS } from "../EnvVars";
import { AzureOpenAI } from "mongodb-rag-core/openai";
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
  OPENAI_RESOURCE_NAME: "",
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
