import {
  EvalConfig,
  makeMongoDbCommandMetadataStore,
} from "mongodb-chatbot-eval";
import {
  makeMongoDbGeneratedDataStore,
  makeGenerateConversationData,
  getConversationsTestCasesFromYaml,
} from "mongodb-chatbot-eval/generate";
import {
  makeEvaluateConversationQuality,
  makeMongoDbEvaluationStore,
} from "mongodb-chatbot-eval/evaluate";
import { makeMongoDbReportStore } from "mongodb-chatbot-eval/report";
import { makeMongoDbConversationsService } from "mongodb-chatbot-server";
import "dotenv/config";
import { strict as assert } from "assert";
import fs from "fs";
import path from "path";
import { AzureKeyCredential, MongoClient } from "mongodb-rag-core";
import {} from "chatbot-server-mongodb-public";

const {
  MONGODB_DATABASE_NAME,
  MONGODB_CONNECTION_URI,
  CONVERSATIONS_SERVER_BASE_URL,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
} = process.env;
assert(MONGODB_DATABASE_NAME, "MONGODB_DATABASE_NAME is required");
assert(MONGODB_CONNECTION_URI, "MONGODB_CONNECTION_URI is required");
assert(
  CONVERSATIONS_SERVER_BASE_URL,
  "CONVERSATIONS_SERVER_BASE_URL is required"
);
assert(
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  "OPENAI_CHAT_COMPLETION_DEPLOYMENT is required"
);
assert(OPENAI_ENDPOINT, "OPENAI_ENDPOINT is required");
assert(OPENAI_API_KEY, "OPENAI_API_KEY is required");

export default async () => {
  const { OpenAIClient } = await import("@azure/openai");
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

  const mongodb = new MongoClient(MONGODB_CONNECTION_URI);
  await mongodb.connect();

  const db = mongodb.db(MONGODB_DATABASE_NAME);
  const conversations = makeMongoDbConversationsService(db);

  const evalConfig = {
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
            conversations,
            httpHeaders: {
              Origin: "Testing",
            },
            apiBaseUrl: CONVERSATIONS_SERVER_BASE_URL,
          }),
        },
      },
      evaluate: {
        conversationQuality: {
          evaluator: makeEvaluateConversationQuality({
            deploymentName: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
            openAiClient: new OpenAIClient(
              OPENAI_ENDPOINT,
              new AzureKeyCredential(OPENAI_API_KEY)
            ),
          }),
        },
      },
    },
    async afterAll() {
      await mongodb.close();
    },
  } satisfies EvalConfig;
  return evalConfig;
};
