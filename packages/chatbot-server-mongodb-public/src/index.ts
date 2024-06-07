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
import { addHeadersToHttpsRequests } from "./addHeadersToHttpRequests";

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
