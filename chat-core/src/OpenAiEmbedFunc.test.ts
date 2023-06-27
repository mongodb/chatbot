import "dotenv/config";

import { assertEnvVars } from "./assertEnvVars";
import { makeOpenAiEmbedFunc } from "./OpenAiEmbedFunc";
import { CORE_ENV_VARS } from "./CoreEnvVars";

describe("Embeddings", () => {
  const {
    OPENAI_ENDPOINT,
    OPENAI_API_KEY,
    OPENAI_EMBEDDING_DEPLOYMENT,
    OPENAI_EMBEDDING_MODEL_VERSION,
  } = assertEnvVars(CORE_ENV_VARS);
  const embed = makeOpenAiEmbedFunc({
    baseUrl: OPENAI_ENDPOINT,
    apiKey: OPENAI_API_KEY,
    apiVersion: OPENAI_EMBEDDING_MODEL_VERSION,
    deployment: OPENAI_EMBEDDING_DEPLOYMENT,
  });
  const userIp = "abc123";
  test("Should return an array of numbers of length 1536", async () => {
    const { embedding } = await embed({
      text: "Hello world",
      userIp,
    });
    expect(embedding).toHaveLength(1536);
  });
  test("Should return an error if the input too large", async () => {
    const input = "Hello world! ".repeat(8192);
    await expect(
      embed({
        text: input,
        userIp,
      })
    ).rejects.toThrow("OpenAI Embedding API returned an error");
  });
});
