import "dotenv/config";
import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-chatbot-server";
import { EVAL_ENV_VARS } from "../EnvVars";
import { AzureOpenAI } from "mongodb-rag-core/openai";
import { wrapOpenAI } from "mongodb-rag-core/braintrust";
import { createOpenAI } from "mongodb-rag-core/aiSdk";

export const {
  JUDGE_EMBEDDING_MODEL,
  JUDGE_LLM,
  OPENAI_API_KEY,
  OPENAI_PREPROCESSOR_CHAT_COMPLETION_DEPLOYMENT,
  OPENAI_CLASSIFIER_CHAT_COMPLETION_DEPLOYMENT,
  OPENAI_ENDPOINT,
  OPENAI_API_VERSION,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  BRAINTRUST_API_KEY,
  BRAINTRUST_ENDPOINT,
} = assertEnvVars({
  ...EVAL_ENV_VARS,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT: "",
  OPENAI_PREPROCESSOR_CHAT_COMPLETION_DEPLOYMENT: "",
  OPENAI_CLASSIFIER_CHAT_COMPLETION_DEPLOYMENT: "",
  OPENAI_API_KEY: "",
  OPENAI_ENDPOINT: "",
  OPENAI_API_VERSION: "",
  ...BRAINTRUST_ENV_VARS,
});

export const openAiClient = wrapOpenAI(
  new AzureOpenAI({
    apiKey: OPENAI_API_KEY,
    endpoint: OPENAI_ENDPOINT,
    apiVersion: OPENAI_API_VERSION,
  })
);

export const openAiProvider = createOpenAI({
  apiKey: BRAINTRUST_API_KEY,
  baseURL: BRAINTRUST_ENDPOINT,
});
