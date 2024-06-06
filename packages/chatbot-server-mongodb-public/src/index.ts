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
import https from "https";
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
} = assertEnvVars(CORE_ENV_VARS);
import { config, mongodb, embeddedContentStore } from "./config";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  logger.info("Starting server...");
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
function addHeadersToHttpsRequests(
  targetHostname: string,
  headers: Record<string, string>
) {
  const originalHttpsRequest = https.request;

  function requestWrapper(
    originalRequest: typeof https.request
  ): typeof https.request {
    const wrappedRequest = function (
      arg1: string | https.RequestOptions | URL,
      arg2?: https.RequestOptions | ((res: http.IncomingMessage) => void),
      arg3?: (res: http.IncomingMessage) => void
    ) {
      let options: https.RequestOptions | undefined;
      let callback: ((res: http.IncomingMessage) => void) | undefined;

      if (typeof arg1 === "string" || arg1 instanceof URL) {
        if (typeof arg2 === "function") {
          options = {};
          callback = arg2;
        } else {
          options = arg2 || {};
          callback = arg3;
        }
      } else {
        options = arg1;
        callback = arg2 as ((res: http.IncomingMessage) => void) | undefined;
      }

      // Extract hostname from options
      const hostname =
        options.hostname ||
        (typeof arg1 === "string" ? new URL(arg1).hostname : arg1.hostname);

      // Check if the hostname is 'targetHostname' and modify headers
      if (hostname === targetHostname) {
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
