import express, { Express } from "express";
import request from "supertest";
import {
  CORE_ENV_VARS,
  EmbeddedContentStore,
  MongoDB,
  assertEnvVars,
  makeDatabaseConnection,
  makeOpenAiEmbedFunc,
} from "chat-core";
import { errorHandler, makeApp, makeHandleTimeoutMiddleware } from "./app";
import { ConversationsService } from "./services/conversations";
import { DataStreamerService } from "./services/dataStreamer";
import { makeOpenAiLlm } from "./services/llm";

describe("App", () => {
  const {
    MONGODB_CONNECTION_URI,
    MONGODB_DATABASE_NAME,
    VECTOR_SEARCH_INDEX_NAME,
    OPENAI_ENDPOINT,
    OPENAI_API_KEY,
    OPENAI_EMBEDDING_DEPLOYMENT,
    OPENAI_EMBEDDING_MODEL_VERSION,
    OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  } = assertEnvVars(CORE_ENV_VARS);

  // Create instances of services
  const mongodb = new MongoDB(
    MONGODB_CONNECTION_URI,
    MONGODB_DATABASE_NAME,
    VECTOR_SEARCH_INDEX_NAME
  );

  const conversations = new ConversationsService(mongodb.db);
  const dataStreamer = new DataStreamerService();

  const embed = makeOpenAiEmbedFunc({
    apiKey: OPENAI_API_KEY,
    apiVersion: OPENAI_EMBEDDING_MODEL_VERSION,
    baseUrl: OPENAI_ENDPOINT,
    deployment: OPENAI_EMBEDDING_DEPLOYMENT,
  });

  const llm = makeOpenAiLlm({
    apiKey: OPENAI_API_KEY,
    deployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
    baseUrl: OPENAI_ENDPOINT,
  });

  let store: EmbeddedContentStore;
  let app: Express;
  beforeAll(async () => {
    store = await makeDatabaseConnection({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_DATABASE_NAME,
    });
    app = await makeApp({
      embed,
      store,
      conversations,
      dataStreamer,
      llm,
      findNearestNeighborsOptions: {
        // Default options
        indexName: "default",
        path: "embedding",
        k: 3,
        minScore: 0.9,
      },
    });
  });

  describe("Error handling", () => {
    test("Should return 404 if path is not found", async () => {
      const response = await request(app).get("/not-a-real-path");
      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual({
        error: "Not Found",
      });
    });
    test("Should return 500 if there is an unexpected error", async () => {
      const errorApp = express();
      errorApp.get("/error", (_req, _res, next) => {
        try {
          throw new Error("Unexpected error");
        } catch (e) {
          next(e);
        }
      });
      errorApp.use(errorHandler);

      const response = await request(errorApp).get("/error");

      expect(response.status).toBe(500);
      expect(response.body).toStrictEqual({
        error: "Unexpected error",
      });
    });

    test("should return 504 if there is a response timeout", async () => {
      const shortTimeOut = 1000; // Create a short timeout for testing purposes
      // make a mock app with the timeout middleware
      const timeoutApp = express();
      timeoutApp.use(makeHandleTimeoutMiddleware(shortTimeOut / 10));
      timeoutApp.get("/response-timeout-test", (_req, res, _next) => {
        setTimeout(() => {
          return res.send("ok");
        }, shortTimeOut);
      });

      const response = await request(timeoutApp).get("/response-timeout-test");
      expect(response.status).toBe(504);
      expect(response.body).toStrictEqual({
        error: "Response timeout",
      });
    });
  });
});
