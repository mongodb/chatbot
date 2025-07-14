import { makeSearchContentRoute } from "./searchContent";
import type { FindContentFunc, FindContentResult } from "mongodb-rag-core";
import type { MongoDbSearchResultsStore } from "mongodb-rag-core";
import { createRequest, createResponse } from "node-mocks-http";

// Helper to create a mock FindContentFunc
function makeMockFindContent(result: FindContentResult) {
  return jest.fn().mockResolvedValue(result) satisfies FindContentFunc;
}

// Helper to create a mock MongoDbSearchResultsStore
function makeMockMongoDbSearchResultsStore() {
  return {
    drop: jest.fn(),
    close: jest.fn(),
    metadata: { databaseName: "mock", collectionName: "mock" },
    saveSearchResult: jest.fn().mockResolvedValue(undefined),
    init: jest.fn(),
  } satisfies MongoDbSearchResultsStore;
}

describe("makeSearchContentRoute", () => {
  const baseReqBody = {
    query: "What is aggregation?",
    limit: 2,
    dataSources: [{ name: "source1", type: "docs", versionLabel: "v1" }],
  };
  // Add all required EmbeddedContent fields for the mock result
  const baseFindContentResult: FindContentResult = {
    queryEmbedding: [0.1, 0.2, 0.3],
    content: [
      {
        url: "https://www.mongodb.com/docs/manual/aggregation",
        text: "Look at all this aggregation",
        metadata: { pageTitle: "Aggregation Operations" },
        sourceName: "source1",
        tokenCount: 8,
        embeddings: { test: [0.1, 0.2, 0.3] },
        updated: new Date(),
        score: 0.8,
      },
      {
        url: "https://mongodb.com/docs",
        text: "MongoDB Docs",
        metadata: { pageTitle: "MongoDB" },
        sourceName: "source1",
        tokenCount: 10,
        embeddings: { test: [0.1, 0.2, 0.3] },
        updated: new Date(),
        score: 0.6,
      },
    ],
  };

  it("should return search results for a valid request", async () => {
    const findContent = makeMockFindContent(baseFindContentResult);
    const searchResultsStore = makeMockMongoDbSearchResultsStore();
    const handler = makeSearchContentRoute({ findContent, searchResultsStore });

    const req = createRequest({
      body: baseReqBody,
      headers: { "req-id": "test-req-id" },
    });
    const res = createResponse();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await handler(req, res as any);

    const data = res._getJSONData();
    expect(data).toHaveProperty("results");
    expect(Array.isArray(data.results)).toBe(true);
    expect(data.results.length).toBe(2);
    expect(data.results[0].url).toBe(
      "https://www.mongodb.com/docs/manual/aggregation"
    );
  });

  it("should call findContent with correct arguments", async () => {
    const findContent = jest.fn().mockResolvedValue(baseFindContentResult);
    const searchResultsStore = makeMockMongoDbSearchResultsStore();
    const handler = makeSearchContentRoute({ findContent, searchResultsStore });
    const req = createRequest({
      body: baseReqBody,
      headers: { "req-id": "test-req-id" },
    });
    const res = createResponse();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await handler(req, res as any);

    expect(findContent).toHaveBeenCalledWith({
      query: baseReqBody.query,
      filters: expect.any(Object),
      limit: baseReqBody.limit,
    });
  });

  it("should call searchResultsStore.saveSearchResult", async () => {
    const findContent = makeMockFindContent(baseFindContentResult);
    const searchResultsStore = makeMockMongoDbSearchResultsStore();
    const handler = makeSearchContentRoute({ findContent, searchResultsStore });
    const req = createRequest({
      body: baseReqBody,
      headers: { "req-id": "test-req-id" },
    });
    const res = createResponse();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await handler(req, res as any);
    expect(searchResultsStore.saveSearchResult).toHaveBeenCalledWith(
      expect.objectContaining({
        query: baseReqBody.query,
        results: baseFindContentResult.content,
        dataSources: baseReqBody.dataSources,
        limit: baseReqBody.limit,
      })
    );
  });

  it("should handle errors from findContent and throw", async () => {
    const findContent = jest.fn().mockRejectedValue(new Error("fail"));
    const searchResultsStore = makeMockMongoDbSearchResultsStore();
    const handler = makeSearchContentRoute({ findContent, searchResultsStore });
    const req = createRequest({
      body: baseReqBody,
      headers: { "req-id": "test-req-id" },
    });
    const res = createResponse();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect(handler(req, res as any)).rejects.toMatchObject({
      message: "Unable to query search database",
      httpStatus: 500,
      name: "RequestError",
    });
  });

  it("should respect `limit` and `dataSources` parameters", async () => {
    const findContent = jest.fn().mockResolvedValue(baseFindContentResult);
    const searchResultsStore = makeMockMongoDbSearchResultsStore();
    const handler = makeSearchContentRoute({ findContent, searchResultsStore });
    const req = createRequest({
      body: { ...baseReqBody, limit: 1, dataSources: [{ name: "source2" }] },
      headers: { "req-id": "test-req-id" },
    });
    const res = createResponse();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await handler(req, res as any);
    expect(findContent).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 1,
        filters: expect.objectContaining({ sourceName: ["source2"] }),
      })
    );
  });
});
