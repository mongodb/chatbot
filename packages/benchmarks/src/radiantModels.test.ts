/**
  @description Quick test to make sure all the Radiant models are functional.
  Useful to test before executing benchmark runs to ensure all models are working.
 */
import { assertEnvVars } from "mongodb-rag-core";
import { envVars } from "./envVars";
import { makeRadiantChatLlm } from "./makeRadiantChatLlm";
import { radiantModels } from "./radiantModels";

describe("Radiant models", () => {
  const { RADIANT_API_KEY, RADIANT_ENDPOINT, MONGODB_AUTH_COOKIE } =
    assertEnvVars(envVars);
  test.each(radiantModels)("$label should generate data", async (model) => {
    const chatLlm = await makeRadiantChatLlm({
      apiKey: RADIANT_API_KEY,
      endpoint: RADIANT_ENDPOINT,
      deployment: model.radiantModelDeployment,
      mongoDbAuthCookie: MONGODB_AUTH_COOKIE,
      lmmConfigOptions: {
        temperature: 0,
      },
    });
    const responseMessage = await chatLlm.answerQuestionAwaited({
      messages: [{ role: "user", content: "Hello" }],
    });
    expect(responseMessage.content).toBeInstanceOf(String);
  });
});
