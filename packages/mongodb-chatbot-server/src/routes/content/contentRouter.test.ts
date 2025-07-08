import request from "supertest";
import { makeTestApp } from "../../test/testHelpers";
import type { MakeContentRouterParams } from "./contentRouter";
import type { MongoDbSearchResultsStore } from "mongodb-rag-core";

// Minimal in-memory mock for SearchResultsStore for testing purposes
const mockSearchResultsStore: MongoDbSearchResultsStore = {
  drop: jest.fn(),
  close: jest.fn(),
  metadata: {
    databaseName: "mock",
    collectionName: "mock",
  },
  saveSearchResult: jest.fn(),
  init: jest.fn()
};

// Helper to build contentRouterConfig for the test app
function makeContentRouterConfig(
  overrides: Partial<MakeContentRouterParams> = {}
) {
  return {
    findContent: jest
      .fn()
      .mockResolvedValue({ content: [], queryEmbedding: [] }),
    searchResultsStore: mockSearchResultsStore,
    ...overrides,
  } satisfies MakeContentRouterParams;
}

describe("contentRouter", () => {
  const searchEndpoint = "/api/v1/content/search";

  it("should return search results for a valid request", async () => {
    const { app, origin } = await makeTestApp({
      contentRouterConfig: makeContentRouterConfig(),
    });
    const res = await request(app)
      .post(searchEndpoint)
      .set("req-id", "test-req-id")
      .set("Origin", origin)
      .send({
        query: "mongodb",
        limit: 2,
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("results");
    expect(Array.isArray(res.body.results)).toBe(true);
  });

  it("should return 400 for missing query field", async () => {
    const { app, origin } = await makeTestApp({
      contentRouterConfig: makeContentRouterConfig(),
    });
    const res = await request(app)
      .post(searchEndpoint)
      .set("req-id", "test-req-id")
      .set("Origin", origin)
      .send({});

    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Invalid request");
  });

  it("should call custom middleware if provided", async () => {
    const mockMiddleware = jest.fn((_req, _res, next) => next());
    const { app, origin } = await makeTestApp({
      contentRouterConfig: makeContentRouterConfig({
        middleware: [mockMiddleware],
      }),
    });
    await request(app)
      .post(searchEndpoint)
      .set("req-id", "test-req-id")
      .set("Origin", origin)
      .send({ query: "mongodb" });
    expect(mockMiddleware).toHaveBeenCalled();
  });

  it("should use the 'limit' parameter to not return more results than requested", async () => {
    const { app, origin } = await makeTestApp({
      contentRouterConfig: makeContentRouterConfig(),
    });
    const limit = 1;
    const res = await request(app)
      .post(searchEndpoint)
      .set("req-id", "test-req-id")
      .set("Origin", origin)
      .send({
        query: "mongodb",
        limit,
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("results");
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.results.length).toBeLessThanOrEqual(limit);
  });
});