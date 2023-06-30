import express, { Express, ErrorRequestHandler, RequestHandler } from "express";
import cors from "cors";
import "dotenv/config";
import { makeConversationsRouter } from "./routes/conversations";
import { llm } from "./services/llm";
import {
  createMessage,
  logger,
  EmbeddedContentStore,
  EmbedFunc,
} from "chat-core";
import { DataStreamerServiceInterface } from "./services/dataStreamer";
import { ObjectId } from "mongodb";
import { ConversationsServiceInterface } from "./services/conversations";

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

export const makeApp = async ({
  embed,
  dataStreamer,
  store,
  conversationsService,
}: {
  embed: EmbedFunc;
  store: EmbeddedContentStore;
  dataStreamer: DataStreamerServiceInterface;
  conversationsService: ConversationsServiceInterface;
}): Promise<Express> => {
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
      store,
      conversations: conversationsService,
    })
  );
  app.all("*", (req, res, next) => {
    return res.status(404).json({ error: "Not Found" }).send();
  });
  app.use(errorHandler);

  return app;
};
