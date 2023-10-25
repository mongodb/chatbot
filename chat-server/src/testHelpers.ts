import { MongoClient } from "chat-core";
import { AppConfig, makeApp } from "./app";
import { MONGODB_CONNECTION_URI, config, systemPrompt } from "./config";
import { makeMongoDbConversationsService } from "./services/conversations";

export function makeTestAppConfig(defaultConfigOverrides?: Partial<AppConfig>) {
  const testDbName = `conversations-test-${Date.now()}`;
  const mongoClient = new MongoClient(MONGODB_CONNECTION_URI);
  const mongodb = mongoClient.db(testDbName);
  const conversations = makeMongoDbConversationsService(mongodb, systemPrompt);
  const appConfig: AppConfig = {
    ...config,
    conversationsRouterConfig: {
      ...config.conversationsRouterConfig,
      conversations,
    },
    apiConversationsRouterConfig: {
      ...config.apiConversationsRouterConfig,
      // conversations,
    },
    ...(defaultConfigOverrides ?? {}),
  };
  return { appConfig, mongodb, conversations, systemPrompt, mongoClient };
}

/**
  Helper function to quickly make an app for testing purposes.
  @param defaultConfigOverrides - optional overrides for default app config
 */
export async function makeTestApp(defaultConfigOverrides?: Partial<AppConfig>) {
  // ip address for local host
  const ipAddress = "127.0.0.1";

  const { appConfig, systemPrompt, mongodb, mongoClient, conversations } =
    makeTestAppConfig(defaultConfigOverrides);
  const app = await makeApp(appConfig);

  return {
    app,
    appConfig,
    conversations,
    ipAddress,
    mongoClient,
    mongodb,
    systemPrompt,
  };
}

export { systemPrompt, generateUserPrompt } from "./config";
