import request from "supertest";
import { makeTestApp } from "../../test/testHelpers";
import type { MakeContentRouterParams } from "./contentRouter";
import type {
  FindContentFunc,
  MongoDbSearchResultsStore,
} from "mongodb-rag-core";

// Minimal in-memory mock for SearchResultsStore for testing purposes
const mockSearchResultsStore: MongoDbSearchResultsStore = {
  drop: jest.fn(),
  close: jest.fn(),
  metadata: {
    databaseName: "mock",
    collectionName: "mock",
  },
  saveSearchResult: jest.fn(),
  init: jest.fn(),
};

const findContentMock = jest.fn().mockResolvedValue({
  content: [],
  queryEmbedding: [],
}) satisfies FindContentFunc;

// Helper to build contentRouterConfig for the test app
function makeContentRouterConfig(
  overrides: Partial<MakeContentRouterParams> = {}
) {
  return {
    findContent: findContentMock,
    searchResultsStore: mockSearchResultsStore,
    ...overrides,
  } satisfies MakeContentRouterParams;
}

describe("contentRouter", () => {
  const searchEndpoint = "/api/v1/content/search";

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
});
