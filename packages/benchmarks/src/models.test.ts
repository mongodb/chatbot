/**
  @description Quick test to make sure all the Radiant models are functional.
  Useful to test before executing benchmark runs to ensure all models are working.
 */
import {
  assertEnvVars,
  CORE_OPENAI_CONNECTION_ENV_VARS,
} from "mongodb-rag-core";
import {
  AWS_BEDROCK_ENV_VARS,
  BRAINTRUST_ENV_VARS,
  envVars,
  GCP_VERTEX_AI_ENV_VARS,
} from "./envVars";
import { models } from "./models";
import { makeOpenAiClientFactory } from "./makeOpenAiClientFactory";
import { OpenAI } from "mongodb-rag-core/openai";
import "dotenv/config";

jest.setTimeout(60000);
// NOTE: due to this issue https://github.com/nodejs/node/issues/39964,
// you must run the tests with a Node version >= 20.0.0
describe.skip("Radiant models", () => {
  test.each(models.filter((m) => m.provider === "radiant"))(
    "'$label' model should generate data",
    async (model) => {
      // Note: this is inside of the tests so that this doesn't throw with the skipped tests.
      // THe assertion inside of the describe block will throw if the env vars are not set,
      // even if the block is skipped.
      const { RADIANT_API_KEY, RADIANT_ENDPOINT, MONGODB_AUTH_COOKIE } =
        assertEnvVars(envVars);
      const openAiClientFactory = makeOpenAiClientFactory({
        radiant: {
          apiKey: RADIANT_API_KEY,
          endpoint: RADIANT_ENDPOINT,
          authCookie: MONGODB_AUTH_COOKIE,
        },
      });
      const openAiClient = openAiClientFactory.makeOpenAiClient(model);
      await expectModelResponse(openAiClient, model.deployment);
    }
  );
});
describe.skip("Braintrust models", () => {
  test.each(models.filter((m) => m.provider === "braintrust"))(
    "'$label' model should generate data",
    async (model) => {
      const { BRAINTRUST_API_KEY, BRAINTRUST_ENDPOINT } =
        assertEnvVars(BRAINTRUST_ENV_VARS);
      const openAiClientFactory = makeOpenAiClientFactory({
        braintrust: {
          apiKey: BRAINTRUST_API_KEY,
          endpoint: BRAINTRUST_ENDPOINT,
        },
      });
      const openAiClient = openAiClientFactory.makeOpenAiClient(model);
      await expectModelResponse(openAiClient, model.deployment);
    }
  );
});

describe.skip("Azure OpenAI models", () => {
  test.each(models.filter((m) => m.provider === "azure_openai"))(
    "'$label' model should generate data",
    async (model) => {
      const { OPENAI_API_KEY, OPENAI_ENDPOINT, OPENAI_API_VERSION } =
        assertEnvVars(CORE_OPENAI_CONNECTION_ENV_VARS);
      const openAiClientFactory = makeOpenAiClientFactory({
        azure: {
          apiKey: OPENAI_API_KEY,
          endpoint: OPENAI_ENDPOINT,
          apiVersion: OPENAI_API_VERSION,
        },
      });
      const openAiClient = openAiClientFactory.makeOpenAiClient(model);
      await expectModelResponse(openAiClient, model.deployment);
    }
  );
});
describe.skip("GCP Vertex AI models", () => {
  test.each(models.filter((m) => m.provider === "gcp_vertex_ai"))(
    "'$label' model should generate data",
    async (model) => {
      const { GCP_API_KEY, GCP_OPENAI_ENDPOINT } = assertEnvVars(
        GCP_VERTEX_AI_ENV_VARS
      );
      const openAiClientFactory = makeOpenAiClientFactory({
        vertexAi: {
          apiKey: GCP_API_KEY,
          endpoint: GCP_OPENAI_ENDPOINT,
        },
      });
      const openAiClient = openAiClientFactory.makeOpenAiClient(model);
      await expectModelResponse(openAiClient, model.deployment);
    }
  );
});
describe.skip("AWS Bedrock models", () => {
  test.each(models.filter((m) => m.provider === "aws_bedrock"))(
    "'$label' model should generate data",
    async (model) => {
      const {
        AWS_ACCESS_KEY_ID,
        AWS_REGION,
        AWS_SECRET_ACCESS_KEY,
        AWS_SESSION_TOKEN,
      } = assertEnvVars(AWS_BEDROCK_ENV_VARS);
      const openAiClientFactory = makeOpenAiClientFactory({
        bedrock: {
          region: AWS_REGION,
          credentials: {
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY,
            sessionToken: AWS_SESSION_TOKEN,
          },
        },
      });
      const openAiClient = openAiClientFactory.makeOpenAiClient(model);
      await expectModelResponse(openAiClient, model.deployment);
    }
  );
});

async function expectModelResponse(client: OpenAI, model: string) {
  const res = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: "Hello" }],
    temperature: 0,
  });
  expect(res.choices[0].message.content).toEqual(expect.any(String));
}
