import express, { ErrorRequestHandler, RequestHandler } from "express";
import cors from "cors";
import "dotenv/config";
import { makeConversationsRouter } from "./routes/conversations";
import { llm } from "./services/llm";
import {
  createMessage,
  logger,
  MongoDB,
  ContentService,
  makeContentServiceOptions,
  OpenAiEmbeddingsClient,
  OpenAiEmbeddingProvider,
  EmbeddingService,
} from "chat-core";
import { DataStreamerService } from "./services/dataStreamer";
import { ObjectId } from "mongodb";
import { ConversationsService } from "./services/conversations";

const {
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE_NAME,
  VECTOR_SEARCH_INDEX_NAME,
} = process.env;
// Create instances of services
export const mongodb = new MongoDB(
  MONGODB_CONNECTION_URI!,
  MONGODB_DATABASE_NAME!,
  VECTOR_SEARCH_INDEX_NAME!
);
const contentServiceOptions = makeContentServiceOptions({
  indexName: mongodb.vectorSearchIndexName,
});
const content = new ContentService(mongodb.db, contentServiceOptions);
const {
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_EMBEDDING_DEPLOYMENT,
  OPENAI_EMBEDDING_MODEL_VERSION,
} = process.env;
const openaiClient = new OpenAiEmbeddingsClient(
  OPENAI_ENDPOINT!,
  OPENAI_EMBEDDING_DEPLOYMENT!,
  OPENAI_API_KEY!,
  OPENAI_EMBEDDING_MODEL_VERSION!
);
const openAiEmbeddingProvider = new OpenAiEmbeddingProvider(openaiClient);
const embeddings = new EmbeddingService(openAiEmbeddingProvider);
const conversationsService = new ConversationsService(mongodb.db);
const dataStreamer = new DataStreamerService();

// General error handler; called at usage of next() in routes
const errorHandler: ErrorRequestHandler = (err, req, res) => {
  // const reqId = getRequestId(req);
  // logger.error(
  //   createMessage(`Error Request Handler caught an error: ${err}`, reqId)
  // );
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal Server Error" });
  if (res.writable && !res.headersSent) {
    res.status(status).json({ error: err.message });
  } else {
    // Ensure response ends if headers were already sent
    res.end();
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
  app.use(cors()); // TODO: add specific options to only allow certain origins
  app.use(express.json());
  app.use(reqHandler);
  app.use(
    "/conversations",
    makeConversationsRouter({
      llm,
      embeddings,
      dataStreamer,
      content,
      conversations: conversationsService,
    })
  );
  app.use(errorHandler);

  return app;
};
