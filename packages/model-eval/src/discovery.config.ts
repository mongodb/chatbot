import {
  EvalConfig,
  makeMongoDbCommandMetadataStore,
  makeMongoDbGeneratedDataStore,
  makeMongoDbEvaluationStore,
  makeMongoDbReportStore,
  getConversationsTestCasesFromYaml,
} from "mongodb-chatbot-evaluation";
import fs from "fs";
import path from "path";
import "dotenv/config";
import { MongoClient, assertEnvVars } from "mongodb-rag-core";
import { envVars } from "./envVars";
import { makeChatLlmConversationEvalCommands } from "./makeChatLlmEvalCommands";
import { makeRadiantChatLlm } from "./makeRadiantChatLlm";
import { radiantModels } from "./radiantModels";

export default async () => {
  const {
    MONGODB_DATABASE_NAME,
    MONGODB_CONNECTION_URI,
    RADIANT_API_KEY,
    RADIANT_ENDPOINT,
    MONGODB_AUTH_COOKIE,
  } = assertEnvVars(envVars);

  const storeDbOptions = {
    connectionUri: MONGODB_CONNECTION_URI,
    databaseName: MONGODB_DATABASE_NAME,
  };

  const mongodb = new MongoClient(MONGODB_CONNECTION_URI);
  await mongodb.connect();

  const discoveryConversationTestCases = getConversationsTestCasesFromYaml(
    fs.readFileSync(
      path.resolve(__dirname, "..", "testCases", "discovery.yml"),
      "utf8"
    )
  );
  const chatLlmConfigs = await Promise.all(
    radiantModels.map(async (model) => {
      return {
        name: model.label,
        chatLlm: await makeRadiantChatLlm({
          apiKey: RADIANT_API_KEY,
          endpoint: RADIANT_ENDPOINT,
          deployment: model.radiantModelDeployment,
          mongoDbAuthCookie: MONGODB_AUTH_COOKIE,
          lmmConfigOptions: {
            temperature: 0,
          },
        }),
      };
    })
  );

  const evalConfig = {
    metadataStore: makeMongoDbCommandMetadataStore(storeDbOptions),
    generatedDataStore: makeMongoDbGeneratedDataStore(storeDbOptions),
    evaluationStore: makeMongoDbEvaluationStore(storeDbOptions),
    reportStore: makeMongoDbReportStore(storeDbOptions),

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
