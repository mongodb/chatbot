import { strict as assert } from "assert";
import {
  MongoClient,
  Db,
  AppConfig,
  makeApp,
  makeMongoDbConversationsService,
} from "mongodb-chatbot-server";
import { MONGODB_CONNECTION_URI, config, systemPrompt } from "../config";

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

export function cosineSimilarity(a: number[], b: number[]) {
  // https://towardsdatascience.com/how-to-build-a-textual-similarity-analysis-web-app-aa3139d4fb71

  const magnitudeA = Math.sqrt(dotProduct(a, a));
  const magnitudeB = Math.sqrt(dotProduct(b, b));
  if (magnitudeA && magnitudeB) {
    // https://towardsdatascience.com/how-to-measure-distances-in-machine-learning-13a396aa34ce
    return dotProduct(a, b) / (magnitudeA * magnitudeB);
  } else {
    return 0;
  }
}

function dotProduct(a: number[], b: number[]) {
  return a.reduce((acc, cur, i) => acc + cur * b[i], 0);
}

export {
  systemPrompt,
  generateUserPrompt,
  openAiClient,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  OPENAI_EMBEDDING_DEPLOYMENT,
  findContent,
} from "../config";
