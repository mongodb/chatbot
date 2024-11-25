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

export const {
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE_NAME,
  VECTOR_SEARCH_INDEX_NAME,
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
  OPENAI_VERIFIED_ANSWER_EMBEDDING_DEPLOYMENT,
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
