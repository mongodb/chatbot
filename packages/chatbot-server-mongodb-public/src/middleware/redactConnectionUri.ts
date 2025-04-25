import { ConversationsMiddleware } from "mongodb-chatbot-server";
import { getRequestId, logRequest } from "../utils";
import { redactMongoDbConnectionUri } from "mongodb-rag-core/executeCode";

/**
  Middleware that redacts MongoDB connection URIs in request bodies to prevent
  sensitive information from being logged or stored.

  This middleware looks for MongoDB connection URIs in the request body and
  replaces the username and password with placeholders.
 */
export function redactConnectionUri(): ConversationsMiddleware {
  return (req, res, next) => {
    const reqId = getRequestId(req);

    // Skip if there's no body
    if (!req.body) {
      next();
      return;
    }

    // Process the message for addMessageToConversations if it exists
    if (req.body.message && typeof req.body.message === "string") {
      req.body.message = redactMongoDbConnectionUri(req.body.message);
    }

    logRequest({
      reqId,
      message: "Redacted MongoDB connection URIs in request body",
    });

    next();
  };
}
