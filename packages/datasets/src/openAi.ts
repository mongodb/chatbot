import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { OpenAI } from "mongodb-rag-core/openai";
import { wrapOpenAI } from "mongodb-rag-core/braintrust";

const { BRAINTRUST_API_KEY, BRAINTRUST_ENDPOINT } =
  assertEnvVars(BRAINTRUST_ENV_VARS);

export const openAiClient = wrapOpenAI(
  new OpenAI({
    apiKey: BRAINTRUST_API_KEY,
    baseURL: BRAINTRUST_ENDPOINT,
  })
);

export const model = "gpt-4o";
