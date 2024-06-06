/**
  @fileoverview This file contains the implementation of the MongoDB Docs AI chat server.
 */
import "dotenv/config";
import {
  makeApp,
  logger,
  CORE_ENV_VARS,
  assertEnvVars,
} from "mongodb-chatbot-server";
import https, { request, RequestOptions } from "https";
import http from "http";
import { URL } from "url";

export const {
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE_NAME,
  VECTOR_SEARCH_INDEX_NAME,
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_EMBEDDING_DEPLOYMENT,
  OPENAI_EMBEDDING_MODEL_VERSION,
  OPENAI_CHAT_COMPLETION_MODEL_VERSION,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  NODE_ENV,
} = assertEnvVars(CORE_ENV_VARS);
import { config, mongodb, embeddedContentStore } from "./config";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  logger.info("Starting server...");

  // Adds the CorpSecure AUTH_COOKIE to HTTPS requests if it is set.
  // This should only be used for local development.
  // This is to allow the chatbot server running locally to access Radiant which is behind CorpSecure.
  // If the server is running in Kubernetes, the CorpSecure cookie is not needed.
  if (NODE_ENV === "development" && process.env.AUTH_COOKIE !== undefined) {
    logger.info("Adding cookie to HTTPS requests since AUTH_COOKIE is set");
    addHeadersToHttpsRequests(new URL(OPENAI_ENDPOINT).hostname, {
      cookie: process.env.AUTH_COOKIE,
    });
  }
  const app = await makeApp(config);
  const server = app.listen(PORT, () => {
    logger.info(`Server listening on port: ${PORT}`);
  });

  process.on("SIGINT", async () => {
    logger.info("SIGINT signal received");
    await mongodb.close();
    await embeddedContentStore.close();
    await new Promise<void>((resolve, reject) => {
      server.close((error: unknown) => {
        error ? reject(error) : resolve();
      });
    });
    process.exit(1);
  });
};

try {
  startServer();
} catch (e) {
  logger.error(`Fatal error: ${e}`);
  process.exit(1);
}

/**
  This function appends arbitrary headers to HTTPS requests made to a specific hostname.
 */
function addHeadersToHttpsRequests(
  targetHostname: string,
  headers: Record<string, string>
) {
  const originalHttpsRequest = request;

  function requestWrapper(originalRequest: typeof request): typeof request {
    const wrappedRequest = function (
      arg1: string | RequestOptions | URL,
      arg2?: RequestOptions | ((res: http.IncomingMessage) => void),
      arg3?: (res: http.IncomingMessage) => void
    ) {
      let options: RequestOptions | undefined;

      if (typeof arg1 === "string" || arg1 instanceof URL) {
        if (typeof arg2 === "function") {
          options = {};
        } else {
          options = arg2 || {};
        }
      } else {
        options = arg1;
      }

      // Extract hostname from options
      const hostname =
        options.hostname ||
        (typeof arg1 === "string" ? new URL(arg1).hostname : arg1.hostname);

      // Check if the hostname is 'targetHostname' and modify headers
      if (hostname === targetHostname) {
        logger.log("Adding headers for Request to:", options.path);
        options.headers = options.headers || {};
        for (const [key, value] of Object.entries(headers)) {
          options.headers[key] = value;
        }
      }

      // Call the original request function with correct parameters
      return originalRequest(arg1 as any, arg2 as any, arg3);
    };

    return wrappedRequest;
  }

  https.request = requestWrapper(originalHttpsRequest);
}
