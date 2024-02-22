import {
  EvalConfig,
  makeMongoDbCommandMetadataStore,
} from "mongodb-chatbot-eval";
import {
  makeMongoDbGeneratedDataStore,
  makeGenerateConversationData,
  getConversationsTestCasesFromYaml,
} from "mongodb-chatbot-eval/generate";
import { makeMongoDbEvaluationStore } from "mongodb-chatbot-eval/evaluate";
import { makeMongoDbReportStore } from "mongodb-chatbot-eval/report";
import {
  makeApp,
  makeMongoDbConversationsService,
} from "mongodb-chatbot-server";
import dotenv from "dotenv";
import { strict as assert } from "assert";
import fs from "fs";
import path from "path";
import { MongoClient } from "mongodb-rag-core";

// Use same dotenv file as chatbot-server-mongodb-public.
// Need this to load config from there.
const dotenvPath = path.resolve(
  __dirname,
  "..",
  "..",
  "chatbot-server-mongodb-public",
  ".env"
);
dotenv.config({
  path: dotenvPath,
});

const { MONGODB_DATABASE_NAME, MONGODB_CONNECTION_URI } = process.env;
assert(MONGODB_DATABASE_NAME, "MONGODB_DATABASE_NAME is required");
assert(MONGODB_CONNECTION_URI, "MONGODB_CONNECTION_URI is required");

export default async () => {
  // dynamic import to allow loading from .env file before import
  const { config, embeddedContentStore, systemPrompt, mongodb } = await import(
    "chatbot-server-mongodb-public"
  );
  const app = await makeApp(config);
  const testCases = getConversationsTestCasesFromYaml(
    fs.readFileSync(
      path.resolve(__dirname, "..", "testCases", "conversations.yml"),
      "utf8"
    )
  );
  const storeDbOptions = {
    connectionUri: MONGODB_CONNECTION_URI,
    databaseName: MONGODB_DATABASE_NAME,
  };

  await mongodb.connect();
  const db = mongodb.db(MONGODB_DATABASE_NAME);

  const evalConfig: EvalConfig = {
    metadataStore: makeMongoDbCommandMetadataStore(storeDbOptions),
    generatedDataStore: makeMongoDbGeneratedDataStore(storeDbOptions),
    evaluationStore: makeMongoDbEvaluationStore(storeDbOptions),
    reportStore: makeMongoDbReportStore(storeDbOptions),
    commands: {
      generate: {
        conversations: {
          type: "conversation",
          testCases,
          generator: makeGenerateConversationData({
            conversations: makeMongoDbConversationsService(db, systemPrompt),
            testApp: app,
          }),
        },
      },
    },
    async afterAll() {
      await mongodb.close();
      await embeddedContentStore.close();
    },
  };
  return evalConfig;
};
