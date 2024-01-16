import {
  MongoClient,
  AppConfig,
  makeApp,
  makeMongoDbConversationsService,
} from "mongodb-chatbot-server";
import { MONGODB_CONNECTION_URI, config, systemPrompt } from "../config";

export function makeTestAppConfig(defaultConfigOverrides?: Partial<AppConfig>) {
  const testDbName = `conversations-test-${Date.now()}`;
  const mongoClient = new MongoClient(MONGODB_CONNECTION_URI);
  const db = mongoClient.db(testDbName);
  const conversations = makeMongoDbConversationsService(db, systemPrompt);
  const appConfig: AppConfig = {
    ...config,
    conversationsRouterConfig: {
      ...config.conversationsRouterConfig,
      conversations,
    },
    ...(defaultConfigOverrides ?? {}),
  };
  return { appConfig, db, conversations, systemPrompt, mongoClient };
}

/**
  Helper function to quickly make an app for testing purposes.
  @param defaultConfigOverrides - optional overrides for default app config
 */
export async function makeTestApp(defaultConfigOverrides?: Partial<AppConfig>) {
  // ip address for local host
  const ipAddress = "127.0.0.1";

  const { appConfig, systemPrompt, db, mongoClient, conversations } =
    makeTestAppConfig(defaultConfigOverrides);
  const app = await makeApp(appConfig);

  return {
    app,
    appConfig,
    conversations,
    ipAddress,
    mongoClient,
    db,
    systemPrompt,
  };
}

export { systemPrompt, generateUserPrompt } from "../config";
