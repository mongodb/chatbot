import {
  EvalConfig,
  getConversationsTestCasesFromYaml,
} from "mongodb-chatbot-evaluation";
import fs from "fs";
import path from "path";
import "dotenv/config";
import { assertEnvVars } from "mongodb-rag-core";
import { MongoClient } from "mongodb-rag-core/mongodb";
import { envVars } from "./envVars";
import { makeChatLlmConversationEvalCommands } from "./makeChatLlmConversationEvalCommands";
import { makeRadiantChatLlm } from "./makeRadiantChatLlm";
import { models } from "./models";
import { makeBaseConfig } from "./baseConfig";

export default async () => {
  const {
    MONGODB_DATABASE_NAME,
    MONGODB_CONNECTION_URI,
    RADIANT_API_KEY,
    RADIANT_ENDPOINT,
    MONGODB_AUTH_COOKIE,
  } = assertEnvVars(envVars);

  const mongodb = new MongoClient(MONGODB_CONNECTION_URI);
  await mongodb.connect();

  const discoveryConversationTestCases = getConversationsTestCasesFromYaml(
    fs.readFileSync(
      path.resolve(__dirname, "..", "datasets", "discovery.yml"),
      "utf8"
    )
  );
  const chatLlmConfigs = await Promise.all(
    models.map(async (model) => {
      return {
        name: model.label,
        chatLlm: await makeRadiantChatLlm({
          apiKey: RADIANT_API_KEY,
          endpoint: RADIANT_ENDPOINT,
          deployment: model.deployment,
          mongoDbAuthCookie: MONGODB_AUTH_COOKIE,
          lmmConfigOptions: {
            temperature: 0,
            max_tokens: 2000,
          },
        }),
      };
    })
  );

  const evalConfig = {
    ...makeBaseConfig(MONGODB_CONNECTION_URI, MONGODB_DATABASE_NAME),
    commands: makeChatLlmConversationEvalCommands({
      chatLlmConfigs,
      testCases: discoveryConversationTestCases,
    }),
    async afterAll() {
      await mongodb.close();
    },
  } satisfies EvalConfig;
  return evalConfig;
};
