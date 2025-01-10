import {
  assertEnvVars,
  CORE_OPENAI_CONNECTION_ENV_VARS,
} from "mongodb-rag-core";
import {
  RADIANT_ENV_VARS,
  BRAINTRUST_ENV_VARS,
  AWS_BEDROCK_ENV_VARS,
  GCP_VERTEX_AI_ENV_VARS,
} from "./envVars";
import { makeOpenAiClientFactory } from "./makeOpenAiClientFactory";

const {
  BRAINTRUST_API_KEY,
  BRAINTRUST_ENDPOINT,
  RADIANT_API_KEY,
  RADIANT_ENDPOINT,
  MONGODB_AUTH_COOKIE,
  OPENAI_API_KEY,
  OPENAI_ENDPOINT,
  OPENAI_API_VERSION,
  AWS_ACCESS_KEY_ID,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
  AWS_SESSION_TOKEN,
  GCP_API_KEY,
  GCP_OPENAI_ENDPOINT,
} = assertEnvVars({
  ...RADIANT_ENV_VARS,
  ...BRAINTRUST_ENV_VARS,
  ...CORE_OPENAI_CONNECTION_ENV_VARS,
  ...AWS_BEDROCK_ENV_VARS,
  ...GCP_VERTEX_AI_ENV_VARS,
});

export const openAiClientFactory = makeOpenAiClientFactory({
  azure: {
    apiKey: OPENAI_API_KEY,
    apiVersion: OPENAI_API_VERSION,
    endpoint: OPENAI_ENDPOINT,
  },
  radiant: {
    apiKey: RADIANT_API_KEY,
    endpoint: RADIANT_ENDPOINT,
    authCookie: MONGODB_AUTH_COOKIE,
  },
  braintrust: {
    apiKey: BRAINTRUST_API_KEY,
    endpoint: BRAINTRUST_ENDPOINT,
  },
  vertexAi: {
    apiKey: GCP_API_KEY,
    endpoint: GCP_OPENAI_ENDPOINT,
  },
  bedrock: {
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
      sessionToken: AWS_SESSION_TOKEN,
    },
  },
});
