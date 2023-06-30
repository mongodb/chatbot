import "dotenv/config";
import { makeApp } from "./app";
import {
  logger,
  assertEnvVars,
  CORE_ENV_VARS,
  MongoDB,
  makeDatabaseConnection,
  makeOpenAiEmbedFunc,
} from "chat-core";
import { ConversationsService } from "./services/conversations";
import { DataStreamerService } from "./services/dataStreamer";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  const {
    MONGODB_CONNECTION_URI,
    MONGODB_DATABASE_NAME,
    VECTOR_SEARCH_INDEX_NAME,
    OPENAI_ENDPOINT,
    OPENAI_API_KEY,
    OPENAI_EMBEDDING_DEPLOYMENT,
    OPENAI_EMBEDDING_MODEL_VERSION,
  } = assertEnvVars(CORE_ENV_VARS);

  // Create instances of services
  const mongodb = new MongoDB(
    MONGODB_CONNECTION_URI,
    MONGODB_DATABASE_NAME,
    VECTOR_SEARCH_INDEX_NAME
  );

  const conversations = new ConversationsService(mongodb.db);
  const dataStreamer = new DataStreamerService();

  const store = await makeDatabaseConnection({
    connectionUri: MONGODB_CONNECTION_URI,
    databaseName: MONGODB_DATABASE_NAME,
  });

  const embed = makeOpenAiEmbedFunc({
    apiKey: OPENAI_API_KEY,
    apiVersion: OPENAI_EMBEDDING_MODEL_VERSION,
    baseUrl: OPENAI_ENDPOINT,
    deployment: OPENAI_EMBEDDING_DEPLOYMENT,
  });

  try {
    const app = await makeApp({
      embed,
      store,
      conversations,
      dataStreamer,
    });

    const server = app.listen(PORT, () => {
      logger.info(`Server listening on port: ${PORT}`);
    });

    process.on("SIGINT", async () => {
      logger.info("SIGINT signal received");
      await mongodb.close();
      await store.close();
      server.close();
    });
  } finally {
    await mongodb.close();
    await store.close();
  }
};

try {
  startServer();
} catch (e) {
  logger.error(`Fatal error: ${e}`);
  process.exit(1);
}
