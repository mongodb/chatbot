import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { OpenAI } from "mongodb-rag-core/openai";
import { wrapOpenAI, wrapAISDKModel } from "mongodb-rag-core/braintrust";
import { createOpenAI } from "mongodb-rag-core/aiSdk";

const { BRAINTRUST_API_KEY, BRAINTRUST_ENDPOINT } =
  assertEnvVars(BRAINTRUST_ENV_VARS);

export const openAiClient = wrapOpenAI(
  new OpenAI({
    apiKey: BRAINTRUST_API_KEY,
    baseURL: BRAINTRUST_ENDPOINT,
  })
);

export const openAiProvider = createOpenAI({
  apiKey: BRAINTRUST_API_KEY,
  baseURL: BRAINTRUST_ENDPOINT,
});

export const model = "gpt-4o";
