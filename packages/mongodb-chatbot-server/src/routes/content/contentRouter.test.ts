import { Express } from "express";
import request from "supertest";
import type {
  FindContentFunc,
  MongoDbSearchResultsStore,
} from "mongodb-rag-core";
import type {
  MakeContentRouterParams,
  SearchContentMiddleware,
} from "./contentRouter";
import { makeTestApp } from "../../test/testHelpers";
import { embeddedContentStore } from "../../test/testConfig";

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

function makeMockContentRouterConfig(
  overrides: Partial<MakeContentRouterParams> = {},
) {
  return {
    findContent: findContentMock,
    searchResultsStore: mockSearchResultsStore,
    embeddedContentStore,
    ...overrides,
  } satisfies MakeContentRouterParams;
}

describe("contentRouter", () => {
  const ipAddress = "127.0.0.1";
  const searchEndpoint = "/api/v1/content/search";

  it("should call custom middleware if provided", async () => {
    const mockMiddleware = jest.fn((_req, _res, next) => next());
    const { app, origin } = await makeTestApp({
      contentRouterConfig: makeMockContentRouterConfig({
        middleware: [mockMiddleware],
      }),
    });
    await createContentReq({ app, origin, query: "mongodb" });
    expect(mockMiddleware).toHaveBeenCalled();
  });

  test("should use route middleware customData", async () => {
    const middleware1: SearchContentMiddleware = (_, res, next) => {
      res.locals.customData.middleware1 = true;
      next();
    };
    let called = false;
    const middleware2: SearchContentMiddleware = (_, res, next) => {
      expect(res.locals.customData.middleware1).toBe(true);
      called = true;
      next();
    };
    const { app, origin } = await makeTestApp({
      contentRouterConfig: makeMockContentRouterConfig({
        middleware: [middleware1, middleware2],
      }),
    });
    await createContentReq({ app, origin, query: "What is aggregation?" });
    expect(called).toBe(true);
  });

  /**
    Helper function to create a new content request
   */
  async function createContentReq({
    app,
    origin,
    query,
  }: {
    app: Express;
    origin: string;
    query: string;
  }) {
    const createContentRes = await request(app)
      .post(searchEndpoint)
      .set("X-FORWARDED-FOR", ipAddress)
      .set("Origin", origin)
      .send({ query });
    return createContentRes;
  }
});
