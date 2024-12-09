import { FindContentFunc, updateFrontMatter } from "mongodb-rag-core";
import { retrieveRelevantContent } from "./retrieveRelevantContent";
import { makeMockOpenAIToolCall } from "../test/mockOpenAi";
import { StepBackUserQueryMongoDbFunction } from "./makeStepBackUserQuery";
import { OpenAI } from "mongodb-rag-core/openai";

jest.mock("mongodb-rag-core/openai", () =>
  makeMockOpenAIToolCall({ transformedUserQuery: "transformedUserQuery" })
);
describe("retrieveRelevantContent", () => {
  const model = "model";
  const funcRes = {
    transformedUserQuery: "transformedUserQuery",
  } satisfies StepBackUserQueryMongoDbFunction;
  const fakeEmbedding = [1, 2, 3];

  const fakeContentBase = {
    embeddings: { fakeModelName: fakeEmbedding },
    score: 1,
    url: "url",
    tokenCount: 3,
    sourceName: "sourceName",
    updated: new Date(),
  };
  const fakeFindContent: FindContentFunc = async ({ query }) => {
    return {
      content: [
        {
          text: "all about " + query,
          ...fakeContentBase,
        },
      ],
      queryEmbedding: fakeEmbedding,
    };
  };

  const mockToolCallOpenAi = new OpenAI({
    apiKey: "apiKey",
  });
  const argsBase = {
    openAiClient: mockToolCallOpenAi,
    model,
    userMessageText: "something",
    findContent: fakeFindContent,
  };
  const metadataForQuery = {
    programmingLanguage: "javascript",
    mongoDbProduct: "Aggregation Framework",
  };
  it("should return content, queryEmbedding, transformedUserQuery, searchQuery with metadata", async () => {
    const res = await retrieveRelevantContent({
      ...argsBase,
      metadataForQuery,
    });
    expect(res).toEqual({
      content: [
        {
          text: expect.any(String),
          ...fakeContentBase,
        },
      ],
      queryEmbedding: fakeEmbedding,
      transformedUserQuery: funcRes.transformedUserQuery,
      searchQuery: updateFrontMatter(
        funcRes.transformedUserQuery,
        metadataForQuery
      ),
    });
  });
  it("should return content, queryEmbedding, transformedUserQuery, searchQuery without", async () => {
    const res = await retrieveRelevantContent(argsBase);
    expect(res).toEqual({
      content: [
        {
          text: expect.any(String),
          ...fakeContentBase,
        },
      ],
      queryEmbedding: fakeEmbedding,
      transformedUserQuery: funcRes.transformedUserQuery,
      searchQuery: funcRes.transformedUserQuery,
    });
  });
});
