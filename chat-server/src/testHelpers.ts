import {
  MongoDB,
  makeOpenAiEmbedFunc,
  assertEnvVars,
  CORE_ENV_VARS,
  FindNearestNeighborsOptions,
  makeDatabaseConnection,
} from "chat-core";

import { makeOpenAiLlm } from "./services/llm";
import { makeDataStreamer } from "./services/dataStreamer";
import { ConversationsService } from "./services/conversations";
import { makeApp } from "./app";

export async function makeConversationsRoutesDefaults() {
  // ip address for local host
  const ipAddress = "127.0.0.1";
  const {
    MONGODB_CONNECTION_URI,
    OPENAI_ENDPOINT,
    OPENAI_API_KEY,
    OPENAI_EMBEDDING_DEPLOYMENT,
    OPENAI_EMBEDDING_MODEL_VERSION,
    OPENAI_CHAT_COMPLETION_DEPLOYMENT,
    VECTOR_SEARCH_INDEX_NAME,
    MONGODB_DATABASE_NAME,
  } = assertEnvVars(CORE_ENV_VARS);

  // set up embeddings service
  const embed = makeOpenAiEmbedFunc({
    apiKey: OPENAI_API_KEY,
    apiVersion: OPENAI_EMBEDDING_MODEL_VERSION,
    baseUrl: OPENAI_ENDPOINT,
    deployment: OPENAI_EMBEDDING_DEPLOYMENT,
  });

  // set up llm service
  const llm = makeOpenAiLlm({
    baseUrl: OPENAI_ENDPOINT,
    deployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
    apiKey: OPENAI_API_KEY,
  });
  const dataStreamer = makeDataStreamer();

  const store = await makeDatabaseConnection({
    connectionUri: MONGODB_CONNECTION_URI,
    databaseName: MONGODB_DATABASE_NAME,
  });

  const findNearestNeighborsOptions: FindNearestNeighborsOptions = {
    k: 5,
    path: "embedding",
    indexName: VECTOR_SEARCH_INDEX_NAME,
    minScore: 0.9,
  };

  const testDbName = `conversations-test-${Date.now()}`;
  const mongodb = new MongoDB(MONGODB_CONNECTION_URI, testDbName);

  const conversations = new ConversationsService(mongodb.db);
  const appConfig = {
    conversations,
    dataStreamer,
    embed,
    findNearestNeighborsOptions,
    llm,
    store,
  };
  const app = await makeApp(appConfig);

  return {
    ipAddress,
    embed,
    llm,
    dataStreamer,
    findNearestNeighborsOptions,
    mongodb,
    store,
    conversations,
    appConfig,
    app,
  };
}
