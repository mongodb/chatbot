import { strict as assert } from "assert";
import { OpenAI } from "mongodb-rag-core/openai";
import { AppConfig, DEFAULT_API_PREFIX, makeApp } from "../app";
import {
  makeDefaultConfig,
  memoryDb,
  systemPrompt,
  basicResponsesRequestBody,
} from "./testConfig";
import type { CreateResponseRequest } from "../routes/responses/createResponse";

export async function makeTestAppConfig(
  defaultConfigOverrides?: PartialAppConfig
) {
  const config = await makeDefaultConfig();
  const appConfig: AppConfig = {
    ...config,
    ...(defaultConfigOverrides ?? {}),
    async expressAppConfig(app) {
      app.get("/hello", (_req, res) => {
        res.send({ foo: "bar" });
      });
    },
    conversationsRouterConfig: {
      ...config.conversationsRouterConfig,
      ...(defaultConfigOverrides?.conversationsRouterConfig ?? {}),
    },
    responsesRouterConfig: {
      ...config.responsesRouterConfig,
      ...(defaultConfigOverrides?.responsesRouterConfig ?? {}),
    },
  };
  assert(memoryDb, "memoryDb must be defined");
  return { appConfig, systemPrompt, mongodb: memoryDb };
}

export type PartialAppConfig = Omit<
  Partial<AppConfig>,
  "conversationsRouterConfig" | "responsesRouterConfig"
> & {
  conversationsRouterConfig?: Partial<AppConfig["conversationsRouterConfig"]>;
  responsesRouterConfig?: Partial<AppConfig["responsesRouterConfig"]>;
  port?: number;
};

export const TEST_PORT = 5173;
export const TEST_ORIGIN = `http://localhost:`;

/**
  Helper function to quickly make an app for testing purposes. Can't be called
  before `beforeAll()`.
  @param defaultConfigOverrides - optional overrides for default app config
 */
export async function makeTestApp(defaultConfigOverrides?: PartialAppConfig) {
  // ip address for local host
  const ipAddress = "127.0.0.1";
  const origin = TEST_ORIGIN + (defaultConfigOverrides?.port ?? TEST_PORT);

  const { appConfig, systemPrompt, mongodb } = await makeTestAppConfig(
    defaultConfigOverrides
  );
  const app = await makeApp(appConfig);

  return {
    ipAddress,
    origin,
    appConfig,
    app,
    conversations: appConfig.conversationsRouterConfig.conversations,
    mongodb,
    systemPrompt,
  };
}

export const TEST_OPENAI_API_KEY = "test-api-key";

/**
  Helper function to quickly make a local server for testing purposes.
  Builds on the other helpers for app/config stuff.
  @param defaultConfigOverrides - optional overrides for default app config
 */
export const makeTestLocalServer = async (
  defaultConfigOverrides?: PartialAppConfig,
  port?: number
) => {
  const testAppResult = await makeTestApp({
    ...defaultConfigOverrides,
    port,
  });

  const server = testAppResult.app.listen(port ?? TEST_PORT);

  return { ...testAppResult, server };
};

export const makeOpenAiClient = (origin: string, ipAddress: string) => {
  return new OpenAI({
    baseURL: origin + DEFAULT_API_PREFIX,
    apiKey: TEST_OPENAI_API_KEY,
    defaultHeaders: {
      Origin: origin,
      "X-Forwarded-For": ipAddress,
    },
  });
};

export type Stream = Awaited<
  ReturnType<typeof makeCreateResponseRequestStream>
>;

export const makeCreateResponseRequestStream = async (
  openAiClient: OpenAI,
  body?: Omit<Partial<CreateResponseRequest["body"]>, "stream">
) => {
  return await openAiClient.responses.create({
    ...basicResponsesRequestBody,
    ...body,
    stream: true,
  });
};

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
