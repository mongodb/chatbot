import { EmbeddedContent } from "mongodb-rag-core";
import { includeChunksForMaxTokensPossible } from "./includeChunksForMaxTokensPossible";

const embeddings = {
  modelName: [0.1, 0.2, 0.3],
};

describe("includeChunksForMaxTokensPossible()", () => {
  const content: EmbeddedContent[] = [
    {
      url: "https://mongodb.com/docs/realm/sdk/node/",
      text: "foo foo foo",
      tokenCount: 100,
      embeddings,
      sourceName: "realm",
      updated: new Date(),
    },
    {
      url: "https://mongodb.com/docs/realm/sdk/node/",
      text: "bar bar bar",
      tokenCount: 100,
      embeddings,
      sourceName: "realm",
      updated: new Date(),
    },
    {
      url: "https://mongodb.com/docs/realm/sdk/node/",
      text: "baz baz baz",
      tokenCount: 100,
      embeddings,
      sourceName: "realm",
      updated: new Date(),
    },
  ];
  test("Should include all chunks if less that max tokens", () => {
    const maxTokens = 1000;
    const includedChunks = includeChunksForMaxTokensPossible({
      content,
      maxTokens,
    });
    expect(includedChunks).toStrictEqual(content);
  });
  test("should only include subset of chunks that fit within max tokens, inclusive", () => {
    const maxTokens = 200;
    const includedChunks = includeChunksForMaxTokensPossible({
      content,
      maxTokens,
    });
    expect(includedChunks).toStrictEqual(content.slice(0, 2));
    const maxTokens2 = maxTokens + 1;
    const includedChunks2 = includeChunksForMaxTokensPossible({
      content,
      maxTokens: maxTokens2,
    });
    expect(includedChunks2).toStrictEqual(content.slice(0, 2));
  });
});
