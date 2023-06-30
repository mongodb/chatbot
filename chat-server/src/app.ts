import express, {
  Express,
  ErrorRequestHandler,
  RequestHandler,
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from "express";
import cors from "cors";
import timeout from "connect-timeout";
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
import { sendErrorResponse } from "./utils";

// General error handler; called at usage of next() in routes
const errorHandler: ErrorRequestHandler = (err, _req, res) => {
  const status = err.status || 500;

  if (!res.headersSent) {
    return sendErrorResponse(
      res,
      status,
      err.message || "Internal Server Error"
    );
  } else {
    logger.error(err);
  }
};
// TODO:(DOCSP-31121) Apply to all logs in the app
const reqHandler: RequestHandler = (req, _res, next) => {
  const reqId = new ObjectId().toString();
  // Custom header specifically for a request ID. This ID will be used to track
  // logs related to the same request
  req.headers["req-id"] = reqId;
  const message = `Request for: ${req.url}`;
  logger.info(createMessage(message, req.body, reqId));
  next();
};

const haltOnTimedOut: RequestHandler = (req, res, next) => {
  if (req.timedout) {
    logger.error("Request timed out");
    next(new Error("Request timeout"));
  }
};

export const REQUEST_TIMEOUT = 60000; // 60 seconds
export const makeApp = async ({
  embed,
  dataStreamer,
  store,
  conversations,
}: {
  embed: EmbedFunc;
  store: EmbeddedContentStore;
  dataStreamer: DataStreamerServiceInterface;
  conversations: ConversationsServiceInterface;
}): Promise<Express> => {
  const app = express();
  app.use(timeout(REQUEST_TIMEOUT));
  // TODO: consider only serving this from the staging env
  app.use(cors()); // TODO: add specific options to only allow certain origins
  app.use(express.json());
  app.use(reqHandler);
  app.use(haltOnTimedOut);
  app.use(express.static("static"));
  app.use(haltOnTimedOut);
  app.use(
    "/conversations",
    makeConversationsRouter({
      llm,
      embed,
      dataStreamer,
      store,
      conversations,
    })
  );
  app.use(haltOnTimedOut);
  app.all("*", (_req, res, _next) => {
    return sendErrorResponse(res, 404, "Not Found");
  });
  app.use(errorHandler);

  return app;
};
