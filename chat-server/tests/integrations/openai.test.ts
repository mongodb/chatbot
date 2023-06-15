import { Axios } from "axios";
import { OpenAiEmbeddingsClient } from "../../src/integrations/openai";
import "dotenv/config";

describe("OpenAi", () => {
  const {
    OPENAI_ENDPOINT,
    OPENAI_API_KEY,
    OPENAI_EMBEDDING_DEPLOYMENT,
    OPENAI_EMBEDDING_MODEL_VERSION,
  } = process.env;
  const openAiClient = new OpenAiEmbeddingsClient(
    OPENAI_ENDPOINT!,
    OPENAI_EMBEDDING_DEPLOYMENT!,
    OPENAI_API_KEY!,
    OPENAI_EMBEDDING_MODEL_VERSION!
  );
  describe("Embeddings", () => {
    describe("embeddings.create()", () => {
      const userIp = "abc123";

      test("Should return an array of numbers of length 1536", async () => {
        const { data: embeddingResponse, status } = await openAiClient.create({
          input: "Hello world",
          user: userIp,
        });
        expect(status).toBe(200);
        expect(embeddingResponse.data[0].embedding).toHaveLength(1536);
      });
      test("Should return an error if the input too large", async () => {
        const input = "Hello world! ".repeat(8192);
        await expect(
          openAiClient.create({
            input,
            user: userIp,
          })
        ).rejects.toThrow("Request failed with status code 400");
      });
    });
  });
});
