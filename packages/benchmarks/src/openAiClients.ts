import {
  assertEnvVars,
  BRAINTRUST_ENV_VARS,
  GCP_VERTEX_AI_ENV_VARS,
} from "mongodb-rag-core";
import { makeOpenAiClientFactory } from "mongodb-rag-core/models";
import { ModelConfig, models } from "mongodb-rag-core/models";
import { strict as assert } from "assert";
import { LlmOptions } from "mongodb-rag-core/executeCode";

export const MAX_CONCURRENT_EXPERIMENTS = 5;

export function makeLlmOptions(
  model: ModelConfig
): Omit<LlmOptions, "openAiClient"> {
  // Different because OpenAI reasoning models have slightly different options
  if (
    model.label === "o3-mini" ||
    model.label === "o3" ||
    model.label === "o4-mini"
  ) {
    return {
      model: model.deployment,
      max_completion_tokens: 3000,
    };
  }
  return {
    model: model.deployment,
    temperature: 0,
    max_tokens: 3000,
  };
}

const {
  BRAINTRUST_API_KEY,
  BRAINTRUST_ENDPOINT,
  GCP_API_KEY,
  GCP_OPENAI_ENDPOINT,
} = assertEnvVars({
  ...BRAINTRUST_ENV_VARS,
  ...GCP_VERTEX_AI_ENV_VARS,
});

export const openAiClientFactory = makeOpenAiClientFactory({
  braintrust: {
    apiKey: BRAINTRUST_API_KEY,
    endpoint: BRAINTRUST_ENDPOINT,
  },
  vertexAi: {
    apiKey: GCP_API_KEY,
    endpoint: GCP_OPENAI_ENDPOINT,
  },
});
