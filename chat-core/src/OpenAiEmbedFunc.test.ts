import "dotenv/config";

import { assertEnvVars } from "./assertEnvVars";
import { makeOpenAiEmbedFunc } from "./OpenAiEmbedFunc";
import { CORE_ENV_VARS } from "./CoreEnvVars";
import express from "express";

describe("OpenAiEmbedFunc", () => {
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
    const embed = makeOpenAiEmbedFunc({
      baseUrl: OPENAI_ENDPOINT,
      apiKey: OPENAI_API_KEY,
      apiVersion: OPENAI_EMBEDDING_MODEL_VERSION,
      deployment: OPENAI_EMBEDDING_DEPLOYMENT,
      backoffOptions: {
        numOfAttempts: 1,
      },
    });
    await expect(
      embed({
        text: input,
        userIp,
      })
    ).rejects.toThrow("Request failed with status code 400");
  });

  it("should automatically retry on failure", async () => {
    // Mock out the OpenAI endpoint to validate retry behavior
    const app = express();
    const path = "/openai/deployments/test/embeddings";
    let serverHitCount = 0;
    app.post(path, (_req, res) => {
      ++serverHitCount;
      res.statusCode = 429;
      res.send();
    });
    const server = app.listen(10191);
    try {
      const embed = makeOpenAiEmbedFunc({
        baseUrl: `http://127.0.0.1:10191`,
        apiKey: "",
        apiVersion: "",
        deployment: "test",
        backoffOptions: {
          numOfAttempts: 3,
        },
      });
      try {
        await embed({ text: "", userIp: "" });
      } catch (e: any) {
        // Expected to fail - server returns 429
        expect(e.message).toContain("Request failed with status code 429");
      }
      expect(serverHitCount).toBe(3);
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          error ? reject(error) : resolve();
        });
      });
    }
  });
});
