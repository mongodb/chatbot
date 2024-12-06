import { strict as assert } from "assert";
import {
  AppConfig,
  makeApp,
  makeMongoDbConversationsService,
} from "mongodb-chatbot-server";
import { MongoClient, Db } from "mongodb-rag-core/mongodb";
import { systemPrompt } from "../systemPrompt";
import { MONGODB_CONNECTION_URI, config } from "../config";

let mongoClient: MongoClient | undefined;
let mongodb: Db | undefined;
let testDbName: string | undefined;

beforeAll(async () => {
  testDbName = `conversations-test-${Date.now()}`;
  mongoClient = new MongoClient(MONGODB_CONNECTION_URI);
  mongodb = mongoClient.db(testDbName);
});

afterAll(async () => {
  await mongodb?.dropDatabase();
  await mongoClient?.close();
});

export function makeTestAppConfig(defaultConfigOverrides?: Partial<AppConfig>) {
  assert(mongodb !== undefined);
  assert(mongoClient !== undefined);

  const conversations = makeMongoDbConversationsService(mongodb);
  const appConfig: AppConfig = {
    ...config,
    conversationsRouterConfig: {
      ...config.conversationsRouterConfig,
      conversations,
    },
    ...(defaultConfigOverrides ?? {}),
  };
  return { appConfig, mongodb, conversations, systemPrompt };
}

/**
  Helper function to quickly make an app for testing purposes.
  @param defaultConfigOverrides - optional overrides for default app config
 */
export async function makeTestApp(defaultConfigOverrides?: Partial<AppConfig>) {
  // ip address for local host
  const ipAddress = "127.0.0.1";

  const { appConfig, systemPrompt, mongodb, conversations } = makeTestAppConfig(
    defaultConfigOverrides
  );
  const app = await makeApp(appConfig);

  return {
    app,
    appConfig,
    conversations,
    ipAddress,
    mongodb,
    systemPrompt,
  };
}

export { systemPrompt };
export {
  generateUserPrompt,
  openAiClient,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
  OPENAI_VERIFIED_ANSWER_EMBEDDING_DEPLOYMENT,
  OPENAI_PREPROCESSOR_CHAT_COMPLETION_DEPLOYMENT,
  OPENAI_API_VERSION,
  findContent,
  preprocessorOpenAiClient,
} from "../config";
