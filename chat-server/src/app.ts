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
  EmbeddedContentStore,
  EmbedFunc,
  FindNearestNeighborsOptions,
} from "chat-core";
import { DataStreamer } from "./services/dataStreamer";
import { ObjectId } from "mongodb";
import { ConversationsServiceInterface } from "./services/conversations";
import { getRequestId, logRequest, sendErrorResponse } from "./utils";
import {
  Llm,
  OpenAiAwaitedResponse,
  OpenAiStreamingResponse,
} from "./services/llm";
import { SearchBooster } from "./AppConfig";

// General error handler; called at usage of next() in routes
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const reqId = getRequestId(req);
  const httpStatus = err.status || 500;
  const errorMessage = err.message || "Internal Server Error";

  if (!res.headersSent) {
    return sendErrorResponse({
      reqId,
      res,
      httpStatus,
      errorMessage,
    });
  } else {
    logRequest({
      reqId,
      type: "error",
      message: JSON.stringify(err),
    });
  }
};
// TODO:(DOCSP-31121) Apply to all logs in the app
const reqHandler: RequestHandler = (req, _res, next) => {
  const reqId = new ObjectId().toString();
  // Custom header specifically for a request ID. This ID will be used to track
  // logs related to the same request
  req.headers["req-id"] = reqId;
  const message = `Request for: ${req.url}`;
  logRequest({ reqId, message });
  next();
};

export const makeHandleTimeoutMiddleware = (apiTimeout: number) => {
  return (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    // Set the server response timeout for all HTTP responses
    res.setTimeout(apiTimeout, () => {
      return sendErrorResponse({
        reqId: req.headers["req-id"] as string,
        res,
        httpStatus: 504,
        errorMessage: "Response timeout",
      });
    });
    next();
  };
};

export const API_V1_PREFIX = "/api/v1";
export const CONVERSATIONS_API_V1_PREFIX = `${API_V1_PREFIX}/conversations`;

export const REQUEST_TIMEOUT = 60000; // 60 seconds
export const makeApp = async ({
  embed,
  dataStreamer,
  store,
  conversations,
  llm,
  requestTimeout = REQUEST_TIMEOUT,
  findNearestNeighborsOptions,
  searchBoosters,
}: {
  embed: EmbedFunc;
  store: EmbeddedContentStore;
  dataStreamer: DataStreamer;
  conversations: ConversationsServiceInterface;
  llm: Llm<OpenAiStreamingResponse, OpenAiAwaitedResponse>;
  requestTimeout?: number;
  findNearestNeighborsOptions?: Partial<FindNearestNeighborsOptions>;
  searchBoosters?: SearchBooster[];
}): Promise<Express> => {
  const app = express();
  app.use(makeHandleTimeoutMiddleware(requestTimeout));
  app.set("trust proxy", true);
  app.use(cors()); // TODO: add specific options to only allow certain origins
  app.use(express.json());
  app.use(reqHandler);
  // TODO: consider only serving this from the staging env
  app.use(express.static("static"));
  app.use(
    CONVERSATIONS_API_V1_PREFIX,
    makeConversationsRouter({
      llm,
      embed,
      dataStreamer,
      store,
      conversations,
      findNearestNeighborsOptions,
      searchBoosters,
    })
  );
  app.all("*", (req, res, _next) => {
    return sendErrorResponse({
      reqId: getRequestId(req),
      res,
      httpStatus: 404,
      errorMessage: "Not Found",
    });
  });
  app.use(errorHandler);

  return app;
};
