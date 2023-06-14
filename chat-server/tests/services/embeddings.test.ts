import { OpenAIEmbeddingProvider } from "../../src/services/embeddings";
import { OpenAIClient } from "../../src/integrations/openai";
import dotenv from "dotenv";
dotenv.config();

const {
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_EMBEDDING_DEPLOYMENT,
  OPENAI_EMBEDDING_MODEL_VERSION,
} = process.env;
const openaiClient = new OpenAIClient(
  OPENAI_ENDPOINT!,
  OPENAI_EMBEDDING_DEPLOYMENT!,
  OPENAI_API_KEY!,
  OPENAI_EMBEDDING_MODEL_VERSION!
);
const embeddings = new OpenAIEmbeddingProvider(openaiClient);

describe("Embeddings", () => {
  const userIp = "abc123";
  test("Should return an array of numbers of length 1536", async () => {
    const { embeddings: embeddingResponse, status } =
      await embeddings.createEmbedding({
        text: "Hello world",
        userIp,
      });
    expect(status).toBe(200);
    expect(embeddingResponse).toHaveLength(1536);
  });
  test("Should return an error if the input too large", async () => {
    const input = "Hello world! ".repeat(8192);
    const { status, errorData } = await embeddings.createEmbedding({
      text: input,
      userIp,
    });
    expect(status).toBe(400);
    expect(errorData.type).toEqual("invalid_request_error");
  });
});
