import { strict as assert } from "assert";
import {
  MongoClient,
  Db,
  makeMongoDbConversationsService,
} from "mongodb-rag-core";
import { AppConfig, makeApp } from "../app";
import { config, systemPrompt } from "./testConfig";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoClient: MongoClient | undefined;
let mongodb: Db | undefined;
let mongod: MongoMemoryServer | undefined;
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  const testDbName = `conversations-test-${Date.now()}`;
  mongoClient = new MongoClient(uri);
  mongodb = mongoClient.db(testDbName);
});

afterAll(async () => {
  await mongodb?.dropDatabase();
  await mongoClient?.close();
  await mongod?.stop();
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
    async expressAppConfig(app) {
      app.get("/hello", (_req, res) => {
        res.send({ foo: "bar" });
      });
    },
    ...(defaultConfigOverrides ?? {}),
  };
  return { appConfig, mongodb, conversations, systemPrompt, mongoClient };
}

export const TEST_ORIGIN = "http://localhost:5173";

/**
  Helper function to quickly make an app for testing purposes. Can't be called
  before `beforeAll()`.
  @param defaultConfigOverrides - optional overrides for default app config
 */
export async function makeTestApp(defaultConfigOverrides?: Partial<AppConfig>) {
  // ip address for local host
  const ipAddress = "127.0.0.1";
  const origin = TEST_ORIGIN;

  const { appConfig, systemPrompt, mongodb, conversations } = makeTestAppConfig(
    defaultConfigOverrides
  );
  const app = await makeApp(appConfig);

  return {
    ipAddress,
    origin,
    appConfig,
    app,
    conversations,
    mongodb,
    systemPrompt,
  };
}

/**
  Create a URL to represent a client-side route on the test origin.
  @param path - path to append to the origin base URL.
  @returns a URL object with the origin base URL and the path appended.
  @example
    const url = createTestOriginUrl("/conversations");
    expect(url.href).toEqual("http://localhost:5173/conversations")
 */
export function createTestOriginUrl(path: string) {
  return new URL(path, TEST_ORIGIN);
}

export { systemPrompt } from "./testConfig";
