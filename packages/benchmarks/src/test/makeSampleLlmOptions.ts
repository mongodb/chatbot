import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { LlmOptions } from "mongodb-rag-core/executeCode";
import { OpenAI } from "mongodb-rag-core/openai";

export const makeSampleLlmOptions = () => {
  const { BRAINTRUST_API_KEY, BRAINTRUST_ENDPOINT } =
    assertEnvVars(BRAINTRUST_ENV_VARS);
  return {
    openAiClient: new OpenAI({
      apiKey: BRAINTRUST_API_KEY,
      baseURL: BRAINTRUST_ENDPOINT,
    }),
    model: "gpt-4o",
    temperature: 0,
  } satisfies LlmOptions;
};
