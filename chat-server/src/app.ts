import express, { ErrorRequestHandler, RequestHandler } from "express";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import { conversationsRouter } from "./routes/conversations";
// Configure dotenv early so env variables can be read in imported files
dotenv.config();
import { createMessage, logger } from "./services/logger";
import { getRequestId } from "./utils";

interface AppSettings {
  mongoClient?: MongoClient;
}

// General error handler; called at usage of next() in routes
const errorHandler: ErrorRequestHandler = (err, req, res) => {
  const reqId = getRequestId(req);
  logger.error(
    createMessage(`Error Request Handler caught an error: ${err}`, reqId)
  );
  const status = err.status || 500;
  if (res.writable && !res.headersSent) {
    res.sendStatus(status);
  } else {
    // Ensure response ends if headers were already sent
    res.end();
  }
};

// TODO: check with raymund if we'd need this for the current project
// or if only snooty-data-api specific
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
  app.use(reqHandler);
  app.use("/conversations", conversationsRouter);
  app.use(errorHandler);

  return app;
};
