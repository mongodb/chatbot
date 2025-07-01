import request from "supertest";
import { makeTestApp } from "../../test/testHelpers";
import { findContent } from "../../test/testConfig";
import type { MakeContentRouterParams } from "./contentRouter";
import type { SearchResultsStore, SearchResultRecord } from "mongodb-rag-core";
import { DEFAULT_API_PREFIX } from "../../app";

// Minimal in-memory mock for SearchResultsStore for testing purposes
const mockSearchResultsStore: SearchResultsStore = {
  drop: async () => {},
  close: async () => {},
  metadata: {
    databaseName: "mock",
    collectionName: "mock",
  },
  async saveSearchResult(_record: SearchResultRecord) {
    // Not implemented
  },
  async init() {},
};

// Helper to build contentRouterConfig for the test app
function makeContentRouterConfig(overrides: Partial<MakeContentRouterParams> = {}) {
  return {
    findContent,
    searchResultsStore: mockSearchResultsStore,
    ...overrides,
  };
}

describe("contentRouter", () => {
  // const searchEndpoint = DEFAULT_API_PREFIX + "/search";
  const searchEndpoint = "/api/v1/content/search";

  it("should return search results for a valid request", async () => {
    const { app } = await makeTestApp({
      contentRouterConfig: makeContentRouterConfig(),
    });
    const res = await request(app)
      .post(searchEndpoint)
      .set("req-id", "test-req-id")
      .send({
        query: "mongodb",
        limit: 2,
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("results");
    expect(Array.isArray(res.body.results)).toBe(true);
  });

  it("should return 400 for missing query field", async () => {
    const { app } = await makeTestApp({
      contentRouterConfig: makeContentRouterConfig(),
    });
    const res = await request(app)
      .post(searchEndpoint)
      .set("req-id", "test-req-id")
      .send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errorMessage");
  });

  it("should call custom middleware if provided", async () => {
    const mockMiddleware = jest.fn((_req, _res, next) => next());
    const { app } = await makeTestApp({
      contentRouterConfig: makeContentRouterConfig({ middleware: [mockMiddleware] }),
    });
    await request(app)
      .post(searchEndpoint)
      .set("req-id", "test-req-id")
      .send({ query: "mongodb" });
    expect(mockMiddleware).toHaveBeenCalled();
  });

  it("should use the 'limit' parameter to not return more results than requested", async () => {
    const { app } = await makeTestApp({
      contentRouterConfig: makeContentRouterConfig(),
    });
    const limit = 1;
    const res = await request(app)
      .post(searchEndpoint)
      .set("req-id", "test-req-id")
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
