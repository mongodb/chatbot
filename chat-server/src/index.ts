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
import { makeDataStreamer } from "./services/dataStreamer";
import { makeOpenAiLlm } from "./services/llm";
import { config } from "./config";

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
    OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  } = assertEnvVars(CORE_ENV_VARS);

  // Create instances of services
  const mongodb = new MongoDB(
    MONGODB_CONNECTION_URI,
    MONGODB_DATABASE_NAME,
    VECTOR_SEARCH_INDEX_NAME
  );

  const conversations = new ConversationsService(
    mongodb.db,
    config.llm.systemPrompt
  );

  const dataStreamer = makeDataStreamer();

  const store = await makeDatabaseConnection({
    connectionUri: MONGODB_CONNECTION_URI,
    databaseName: MONGODB_DATABASE_NAME,
  });

  const findNearestNeighborsOptions = {
    k: 5,
    path: "embedding",
    indexName: VECTOR_SEARCH_INDEX_NAME,
    minScore: 0.9,
  };

  const embed = makeOpenAiEmbedFunc({
    apiKey: OPENAI_API_KEY,
    apiVersion: OPENAI_EMBEDDING_MODEL_VERSION,
    baseUrl: OPENAI_ENDPOINT,
    deployment: OPENAI_EMBEDDING_DEPLOYMENT,
  });

  const llm = makeOpenAiLlm({
    apiKey: OPENAI_API_KEY,
    deployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
    baseUrl: OPENAI_ENDPOINT,
    llmConfig: config.llm,
  });

  const app = await makeApp({
    embed,
    store,
    conversations,
    dataStreamer,
    llm,
    findNearestNeighborsOptions,
    searchBoosters: config.conversations?.searchBoosters,
  });

  const server = app.listen(PORT, () => {
    logger.info(`Server listening on port: ${PORT}`);
  });

  process.on("SIGINT", async () => {
    logger.info("SIGINT signal received");
    await mongodb.close();
    await store.close();
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
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
