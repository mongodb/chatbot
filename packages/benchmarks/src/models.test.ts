/**
  @description Quick test to make sure all the Radiant models are functional.
  Useful to test before executing benchmark runs to ensure all models are working.
 */
import {
  assertEnvVars,
  CORE_OPENAI_CHAT_COMPLETION_ENV_VARS,
  CORE_OPENAI_CONNECTION_ENV_VARS,
} from "mongodb-rag-core";
import { BRAINTRUST_ENV_VARS, envVars } from "./envVars";
import { models } from "./models";
import { makeOpenAiClientFactory } from "./makeOpenAiClientFactory";
import OpenAI from "openai";
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

async function expectModelResponse(client: OpenAI, model: string) {
  const res = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: "Hello" }],
    temperature: 0,
  });
  expect(res.choices[0].message.content).toEqual(expect.any(String));
}
