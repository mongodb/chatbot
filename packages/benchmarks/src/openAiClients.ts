import {
  assertEnvVars,
  CORE_OPENAI_CONNECTION_ENV_VARS,
} from "mongodb-rag-core";
import { BRAINTRUST_ENV_VARS, GCP_VERTEX_AI_ENV_VARS } from "./envVars";
import { makeOpenAiClientFactory } from "./makeOpenAiClientFactory";

const {
  BRAINTRUST_API_KEY,
  BRAINTRUST_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_ENDPOINT,
  OPENAI_API_VERSION,
  GCP_API_KEY,
  GCP_OPENAI_ENDPOINT,
} = assertEnvVars({
  ...BRAINTRUST_ENV_VARS,
  ...CORE_OPENAI_CONNECTION_ENV_VARS,
  ...GCP_VERTEX_AI_ENV_VARS,
});

export const openAiClientFactory = makeOpenAiClientFactory({
  azure: {
    apiKey: OPENAI_API_KEY,
    apiVersion: OPENAI_API_VERSION,
    endpoint: OPENAI_ENDPOINT,
  },
  braintrust: {
    apiKey: BRAINTRUST_API_KEY,
    endpoint: BRAINTRUST_ENDPOINT,
  },
  vertexAi: {
    apiKey: GCP_API_KEY,
    endpoint: GCP_OPENAI_ENDPOINT,
  },
});
