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
import {
  ConversationsRouterParams,
  makeConversationsRouter,
} from "./routes/conversations/conversationsRouter";
import { logger } from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { getRequestId, logRequest, sendErrorResponse } from "./utils";
import { CorsOptions } from "cors";
import cloneDeep from "lodash.clonedeep";
import { braintrustLogger } from "mongodb-rag-core/braintrust";

/**
  Configuration for the server Express.js app.
 */
export interface AppConfig {
  /**
    Configuration for the conversations router.
   */
  conversationsRouterConfig: ConversationsRouterParams;

  /**
    Maximum time in milliseconds for a request to complete before timing out.
    Defaults to 60000 (1 minute).
   */
  maxRequestTimeoutMs?: number;

  /**
    Configuration for CORS middleware. Defaults to allowing all origins.
   */
  corsOptions?: CorsOptions;

  /**
    Prefix for all API routes. Defaults to `/api/v1`.
   */
  apiPrefix?: string;

  /**
    Additional server logic using the server's `Express` app object.
    Can do things like add additional, routes, global middleware, etc.
    Runs immediately after the app is instantiated,
    before additional routes and middleware are added.
    @example
    (app)=> {
      app.get("/", (req, res) => res.send({ hello: "world" }))
    }
   */
  expressAppConfig?: (app: Express) => Promise<void>;
}

/**
  General error handler. Called at usage of `next()` in routes.
*/
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

export const reqHandler: RequestHandler = (req, _res, next) => {
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

export const DEFAULT_API_PREFIX = "/api/v1";

export const DEFAULT_MAX_REQUEST_TIMEOUT_MS = 60000;

/**
  Constructor function to make the Express.js app.
 */
export const makeApp = async (config: AppConfig): Promise<Express> => {
  const {
    maxRequestTimeoutMs = DEFAULT_MAX_REQUEST_TIMEOUT_MS,
    conversationsRouterConfig,
    corsOptions,
    apiPrefix = DEFAULT_API_PREFIX,
    expressAppConfig,
  } = config;
  logger.info("Server has the following configuration:");
  logger.info(
    stringifyFunctions(cloneDeep(config) as unknown as Record<string, unknown>)
  );

  // Initialize the Braintrust logger if it exists
  if (process.env.BRAINTRUST_TRACING_API_KEY !== undefined) {
    const braintrustLoggerId = await braintrustLogger.id;
    logger.info(`Using Braintrust logger with ID: ${braintrustLoggerId}`);
  } else {
    logger.info("Braintrust logger not initialized");
  }

  const app = express();

  // Instantiate additional server logic, if it exists.
  expressAppConfig && (await expressAppConfig(app));

  // MongoDB chatbot server logic
  app.use(makeHandleTimeoutMiddleware(maxRequestTimeoutMs));
  app.set("trust proxy", true);
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(reqHandler);
  app.use(
    `${apiPrefix}/conversations`,
    makeConversationsRouter(conversationsRouterConfig)
  );

  app.get("/health", (_req, res) => {
    const data = {
      uptime: process.uptime(),
      message: "Ok",
      date: new Date(),
    };

    res.status(200).send(data);
  });
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

/**
  Helper function to stringify functions when logging the config object.
 */
function stringifyFunctions(obj: Record<string, unknown>) {
  if (typeof obj === "function") {
    return (obj as (...args: unknown[]) => unknown)
      .toString()
      .split("\n")
      .map((line) => line.trim())
      .join("\n");
  }
  // Accept objects and arrays
  if (typeof obj === "object" && obj !== null) {
    const newObj: Record<string, unknown> = {};
    for (const key in obj) {
      newObj[key] = stringifyFunctions(obj[key] as Record<string, unknown>);
    }
    return newObj;
  }
  return obj;
}
