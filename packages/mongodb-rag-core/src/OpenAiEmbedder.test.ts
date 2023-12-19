import "dotenv/config";
import { assertEnvVars } from "./assertEnvVars";
import { makeOpenAiEmbedder } from "./OpenAiEmbedder";
import { CORE_ENV_VARS } from "./CoreEnvVars";
import { OpenAIClient, AzureKeyCredential } from "@azure/openai";

describe("OpenAiEmbedFunc", () => {
  const { OPENAI_ENDPOINT, OPENAI_API_KEY, OPENAI_EMBEDDING_DEPLOYMENT } =
    assertEnvVars(CORE_ENV_VARS);
  const openAiClient = new OpenAIClient(
    OPENAI_ENDPOINT,
    new AzureKeyCredential(OPENAI_API_KEY)
  );
  const embedder = makeOpenAiEmbedder({
    deployment: OPENAI_EMBEDDING_DEPLOYMENT,
    openAiClient,
  });
  const userIp = "abc123";

  test("Should return an array of numbers of length 1536", async () => {
    const { embedding } = await embedder.embed({
      text: "Hello world",
      userIp,
    });
    expect(embedding).toHaveLength(1536);
  });

  test("Should return an error if the input too large", async () => {
    const input = "Hello world! ".repeat(8192);
    const embedder = makeOpenAiEmbedder({
      openAiClient: new OpenAIClient(
        OPENAI_ENDPOINT,
        new AzureKeyCredential(OPENAI_API_KEY)
      ),
      deployment: OPENAI_EMBEDDING_DEPLOYMENT,
      backoffOptions: {
        numOfAttempts: 1,
      },
    });
    await expect(async () => {
      await embedder.embed({ text: input, userIp: "" });
    }).rejects.toHaveProperty("type", "invalid_request_error");
  });
  jest.setTimeout(20000);
  it("should automatically retry on failure", async () => {
    let serverHitCount = 0;
    const fakeDeployment = "test";

    const fakeClient = new OpenAIClient(
      OPENAI_ENDPOINT,
      new AzureKeyCredential("not-a-real-key")
    );
    // Mock the getEmbeddings function to throw an error that resembles an axios error
    // to be caught by the retry logic.
    const mockGetEmbeddings = jest.fn().mockImplementation(async () => {
      serverHitCount++;
      throw {
        code: 429,
        message: "Fake error",
      };
    });
    fakeClient.getEmbeddings = mockGetEmbeddings;
    const embedder = makeOpenAiEmbedder({
      openAiClient: fakeClient,
      deployment: fakeDeployment,
      backoffOptions: {
        numOfAttempts: 3,
      },
    });

    try {
      await embedder.embed({ text: "", userIp: "" });
    } catch (e: any) {
      // Expected to fail - server returns 429
      expect(e.message).toContain("Fake error");
    }
    expect(serverHitCount).toBe(3);
  });
});
