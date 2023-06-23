import express, { ErrorRequestHandler, RequestHandler } from "express";
import cors from "cors";
import "dotenv/config";
import { makeConversationsRouter } from "./routes/conversations";
import { llm } from "./services/llm";
import { embeddings } from "./services/embeddings";
import { dataStreamer } from "./services/dataStreamer";
import { content } from "./services/content";
import { conversationsService } from "./services/conversations";
import { ObjectId } from "mongodb";
import { createMessage, logger } from "./services/logger";

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
