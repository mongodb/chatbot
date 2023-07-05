import express, {
  Express,
  ErrorRequestHandler,
  RequestHandler,
  NextFunction,
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import cors from "cors";
import "dotenv/config";
import { makeConversationsRouter } from "./routes/conversations";
import {
  createMessage,
  logger,
  EmbeddedContentStore,
  EmbedFunc,
  FindNearestNeighborsOptions,
} from "chat-core";
import { DataStreamerServiceInterface } from "./services/dataStreamer";
import { ObjectId } from "mongodb";
import { ConversationsServiceInterface } from "./services/conversations";
import { sendErrorResponse } from "./utils";
import {
  Llm,
  OpenAiAwaitedResponse,
  OpenAiStreamingResponse,
} from "./services/llm";

// General error handler; called at usage of next() in routes
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
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

export const makeHandleTimeoutMiddleware = (apiTimeout: number) => {
  return (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    // Set the server response timeout for all HTTP responses
    res.setTimeout(apiTimeout, () => {
      return sendErrorResponse(res, 504, "Response timeout");
    });
    next();
  };
};

export const REQUEST_TIMEOUT = 60000; // 60 seconds
export const makeApp = async ({
  embed,
  dataStreamer,
  store,
  conversations,
  llm,
  requestTimeout = REQUEST_TIMEOUT,
  findNearestNeighborsOptions,
}: {
  embed: EmbedFunc;
  store: EmbeddedContentStore;
  dataStreamer: DataStreamerServiceInterface;
  conversations: ConversationsServiceInterface;
  llm: Llm<OpenAiStreamingResponse, OpenAiAwaitedResponse>;
  requestTimeout?: number;
  findNearestNeighborsOptions?: Partial<FindNearestNeighborsOptions>;
}): Promise<Express> => {
  const app = express();
  app.use(makeHandleTimeoutMiddleware(requestTimeout));
  // TODO: consider only serving this from the staging env
  app.use(cors()); // TODO: add specific options to only allow certain origins
  app.use(express.json());
  app.use(reqHandler);
  app.use(express.static("static"));
  app.use(
    "/conversations",
    makeConversationsRouter({
      llm,
      embed,
      dataStreamer,
      store,
      conversations,
      findNearestNeighborsOptions,
    })
  );
  app.all("*", (_req, res, _next) => {
    return sendErrorResponse(res, 404, "Not Found");
  });
  app.use(errorHandler);

  return app;
};
