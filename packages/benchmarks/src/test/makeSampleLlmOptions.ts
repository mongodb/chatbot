import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { LlmOptions } from "mongodb-rag-core/executeCode";
import { OpenAI } from "mongodb-rag-core/openai";

export const makeSampleLlm = () => {
  const { BRAINTRUST_API_KEY, BRAINTRUST_ENDPOINT } =
    assertEnvVars(BRAINTRUST_ENV_VARS);
  return new OpenAI({
    apiKey: BRAINTRUST_API_KEY,
    baseURL: BRAINTRUST_ENDPOINT,
  });
};

export const makeSampleLlmOptions = () => {
  return {
    model: "gpt-4o",
    temperature: 0,
  } satisfies LlmOptions;
};
