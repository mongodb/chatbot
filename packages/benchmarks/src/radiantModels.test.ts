/**
  @description Quick test to make sure all the Radiant models are functional.
  Useful to test before executing benchmark runs to ensure all models are working.
 */
import { assertEnvVars } from "mongodb-rag-core";
import { envVars } from "./envVars";
import { makeRadiantChatLlm } from "./makeRadiantChatLlm";
import { radiantModels } from "./radiantModels";

jest.setTimeout(60000);
// NOTE: due to this issue https://github.com/nodejs/node/issues/39964,
// you must run the tests with a Node version >= 20.0.0
describe.skip("Radiant models", () => {
  test.each(radiantModels)(
    "'$label' model should generate data",
    async (model) => {
      // Note: this is inside of the tests so that this doesn't throw with the skipped tests.
      // THe assertion inside of the describe block will throw if the env vars are not set,
      // even if the block is skipped.
      const { RADIANT_API_KEY, RADIANT_ENDPOINT, MONGODB_AUTH_COOKIE } =
        assertEnvVars(envVars);
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
      expect(responseMessage.content).toEqual(expect.any(String));
    }
  );
});
