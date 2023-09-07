import { MongoDB } from "chat-core";
import { makeDataStreamer } from "./services/dataStreamer";
import { AppConfig, makeApp } from "./app";
import { MONGODB_CONNECTION_URI, config } from "./index";

/**
  Helper function to quickly make an app for testing purposes.
  @param defaultConfigOverrides - optional overrides for default app config
 */
export async function makeTestApp(defaultConfigOverrides?: Partial<AppConfig>) {
  // ip address for local host
  const ipAddress = "127.0.0.1";

  // set up embeddings service
  const embed = config.conversationsRouterConfig.embed;

  // set up llm service
  const llm = config.conversationsRouterConfig.llm;
  const dataStreamer = makeDataStreamer();

  const store = config.conversationsRouterConfig.store;

  const findNearestNeighborsOptions =
    config.conversationsRouterConfig.findNearestNeighborsOptions;

  const testDbName = `conversations-test-${Date.now()}`;
  const mongodb = new MongoDB(MONGODB_CONNECTION_URI, testDbName);
  const searchBoosters = config.conversationsRouterConfig.searchBoosters;
  const userQueryPreprocessor =
    config.conversationsRouterConfig.userQueryPreprocessor;

  const conversations = config.conversationsRouterConfig.conversations;

  const appConfig = {
    ...config,
    ...(defaultConfigOverrides ?? {}),
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
    searchBoosters,
    userQueryPreprocessor,
  };
}
