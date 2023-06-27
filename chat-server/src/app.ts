import express, { ErrorRequestHandler, RequestHandler } from "express";
import cors from "cors";
import "dotenv/config";
import path from "path";
import { makeConversationsRouter } from "./routes/conversations";
import { llm } from "./services/llm";
import {
  createMessage,
  logger,
  MongoDB,
  ContentService,
  makeContentServiceOptions,
  CORE_ENV_VARS,
  assertEnvVars,
  makeOpenAiEmbedFunc,
} from "chat-core";
import { DataStreamerService } from "./services/dataStreamer";
import { ObjectId } from "mongodb";
import { ConversationsService } from "./services/conversations";

const {
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE_NAME,
  VECTOR_SEARCH_INDEX_NAME,
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_EMBEDDING_DEPLOYMENT,
  OPENAI_EMBEDDING_MODEL_VERSION,
} = assertEnvVars(CORE_ENV_VARS);

// Create instances of services
export const mongodb = new MongoDB(
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE_NAME,
  VECTOR_SEARCH_INDEX_NAME
);
const contentServiceOptions = makeContentServiceOptions({
  indexName: mongodb.vectorSearchIndexName,
});
const content = new ContentService(mongodb.db, contentServiceOptions);

const embed = makeOpenAiEmbedFunc({
  apiKey: OPENAI_API_KEY,
  apiVersion: OPENAI_EMBEDDING_MODEL_VERSION,
  baseUrl: OPENAI_ENDPOINT,
  deployment: OPENAI_EMBEDDING_DEPLOYMENT,
});

const conversationsService = new ConversationsService(mongodb.db);
const dataStreamer = new DataStreamerService();

// General error handler; called at usage of next() in routes
const errorHandler: ErrorRequestHandler = (err, _req, res) => {
  const status = err.status || 500;

  if (!res.headersSent) {
    res.status(status).json({ error: err.message || "Internal Server Error" });
  } else {
    logger.error(err);
  }
};
// Apply to all logs in the app
const reqHandler: RequestHandler = (req, _res, next) => {
  const reqId = new ObjectId().toString();
  // Custom header specifically for a request ID. This ID will be used to track
  // logs related to the same request
  req.headers["req-id"] = reqId;
  const message = `Request for: ${req.url}`;
  logger.info(createMessage(message, req.body, reqId));
  next();
};

export const setupApp = async () => {
  const app = express();
  // TODO: consider only serving this from the staging env
  app.use(express.static("static"));
  app.use(cors()); // TODO: add specific options to only allow certain origins
  app.use(express.json());
  app.use(reqHandler);
  app.use(
    "/conversations",
    makeConversationsRouter({
      llm,
      embed,
      dataStreamer,
      content,
      conversations: conversationsService,
    })
  );
  app.all("*", (req, res, next) => {
    return res.status(404).json({ error: "Not Found" }).send();
  });
  app.use(errorHandler);

  return app;
};
