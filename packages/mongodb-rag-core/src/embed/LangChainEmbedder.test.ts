import "dotenv/config";
import { Embeddings } from "@langchain/core/embeddings";
import { makeLangChainEmbedder } from "./LangChainEmbedder";

jest.setTimeout(10000);
describe("LangChainEmbedder", () => {
  it("embeds text", async () => {
    // how to mock the Embeddings class?
    const langChainEmbeddings = {
      embedQuery: jest.fn().mockResolvedValue([1, 2, 3]),
    } as unknown as Embeddings;
    const embedder = makeLangChainEmbedder({ langChainEmbeddings });
    const result = await embedder.embed({ text: "hello" });
    expect(result).toEqual({ embedding: [1, 2, 3] });
  });
});
