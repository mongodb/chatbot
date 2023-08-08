import express, { Express } from "express";
import request from "supertest";
import {
  EmbeddedContentStore,
  MongoDB,
  makeDatabaseConnection,
  makeOpenAiEmbedFunc,
} from "chat-core";
import { errorHandler, makeApp, makeHandleTimeoutMiddleware } from "./app";
import { ConversationsService } from "./services/conversations";
import { makeDataStreamer } from "./services/dataStreamer";
import { makeOpenAiLlm } from "./services/llm";
import { config } from "./config";

describe("App", () => {
  // Create instances of services
  const mongodb = new MongoDB(
    config.mongodb.connectionUri,
    config.mongodb.databaseName,
    config.mongodb.vectorSearchIndexName
  );

  const conversations = new ConversationsService(
    mongodb.db,
    config.llm.systemPrompt
  );
  const dataStreamer = makeDataStreamer();

  const embed = makeOpenAiEmbedFunc(config.embed);

  const llm = makeOpenAiLlm(config.llm);

  let store: EmbeddedContentStore;
  let app: Express;
  beforeAll(async () => {
    store = await makeDatabaseConnection(config.embeddedContentStore);
    app = await makeApp({
      embed,
      store,
      conversations,
      dataStreamer,
      llm,
      findNearestNeighborsOptions: {
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
          return next(e);
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
          if (!res.headersSent) {
            return res.send("ok");
          }
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
