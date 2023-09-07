import { MongoDB } from "chat-core";
import { AppConfig, makeApp } from "./app";
import { MONGODB_CONNECTION_URI, config, systemPrompt } from "./index";
import { makeConversationsService } from "./services/conversations";

export function makeTestAppConfig(defaultConfigOverrides?: Partial<AppConfig>) {
  const testDbName = `conversations-test-${Date.now()}`;
  const mongodb = new MongoDB(MONGODB_CONNECTION_URI, testDbName);
  const conversations = makeConversationsService(mongodb.db, systemPrompt);
  const appConfig: AppConfig = {
    ...config,
    conversationsRouterConfig: {
      ...config.conversationsRouterConfig,
      conversations,
    },
    ...(defaultConfigOverrides ?? {}),
  };
  return { appConfig, mongodb, systemPrompt };
}

/**
  Helper function to quickly make an app for testing purposes.
  @param defaultConfigOverrides - optional overrides for default app config
 */
export async function makeTestApp(defaultConfigOverrides?: Partial<AppConfig>) {
  // ip address for local host
  const ipAddress = "127.0.0.1";

  const { appConfig, systemPrompt, mongodb } = await makeTestAppConfig(
    defaultConfigOverrides
  );
  const app = await makeApp(appConfig);

  return {
    ipAddress,
    appConfig,
    app,
    mongodb,
    systemPrompt,
  };
}

export { systemPrompt, generateUserPrompt } from "./index";
