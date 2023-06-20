import { OpenAiEmbeddingProvider } from "../../src/services/embeddings";
import { OpenAiEmbeddingsClient } from "../../src/integrations/openai";
import "dotenv/config";

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
const embeddings = new OpenAiEmbeddingProvider(openAiClient);

describe("Embeddings", () => {
  const userIp = "abc123";
  test("Should return an array of numbers of length 1536", async () => {
    const { embedding } = await embeddings.createEmbedding({
      text: "Hello world",
      userIp,
    });
    expect(embedding).toHaveLength(1536);
  });
  test("Should return an error if the input too large", async () => {
    const input = "Hello world! ".repeat(8192);
    await expect(
      embeddings.createEmbedding({
        text: input,
        userIp,
      })
    ).rejects.toThrow("OpenAI Embedding API returned an error");
  });
});
