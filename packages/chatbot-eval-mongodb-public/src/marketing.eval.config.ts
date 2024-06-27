import {
  EvalConfig,
  makeMongoDbCommandMetadataStore,
  makeMongoDbGeneratedDataStore,
  getConversationsTestCasesFromYaml,
  makeMongoDbEvaluationStore,
  makeMongoDbReportStore,
  reportStatsForBinaryEvalRun,
  makeGenerateLlmConversationData,
  makeEvaluateConversationLastMessageIncludesRegex,
} from "mongodb-chatbot-evaluation";
import { makeOpenAiChatLlm } from "mongodb-chatbot-server";
import "dotenv/config";
import fs from "fs";
import path from "path";
import { MongoClient, assertEnvVars } from "mongodb-rag-core";
import { envVars } from "./envVars";
import { systemPrompt } from "chatbot-server-mongodb-public";
export default async () => {
  const {
    MONGODB_DATABASE_NAME,
    MONGODB_CONNECTION_URI,
    OPENAI_CHAT_COMPLETION_DEPLOYMENT,
    OPENAI_ENDPOINT,
    OPENAI_API_KEY,
    OPENAI_GPT_4_CHAT_COMPLETION_DEPLOYMENT,
  } = assertEnvVars(envVars);

  const { OpenAIClient, AzureKeyCredential } = await import("@azure/openai");

  const discoveryTestCases = getConversationsTestCasesFromYaml(
    fs.readFileSync(
      path.resolve(
        __dirname,
        "..",
        "testCases",
        "marketing_discovery_conversations.yml"
      ),
      "utf8"
    )
  );

  const storeDbOptions = {
    connectionUri: MONGODB_CONNECTION_URI,
    databaseName: MONGODB_DATABASE_NAME,
  };

  const mongodb = new MongoClient(MONGODB_CONNECTION_URI);
  await mongodb.connect();

  const evalConfig = {
    metadataStore: makeMongoDbCommandMetadataStore(storeDbOptions),
    generatedDataStore: makeMongoDbGeneratedDataStore(storeDbOptions),
    evaluationStore: makeMongoDbEvaluationStore(storeDbOptions),
    reportStore: makeMongoDbReportStore(storeDbOptions),

    commands: {
      generate: {
        gpt35_0613_discoveryConversations: {
          type: "conversation",
          testCases: discoveryTestCases,
          generator: makeGenerateLlmConversationData({
            chatLlm: makeOpenAiChatLlm({
              deployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT, // GPT-3.5
              openAiClient: new OpenAIClient(
                OPENAI_ENDPOINT,
                new AzureKeyCredential(OPENAI_API_KEY)
              ),
              openAiLmmConfigOptions: {
                temperature: 0,
                maxTokens: 500,
              },
            }),
          }),
        },
        gpt4_0124_discoveryConversations: {
          type: "conversation",
          testCases: discoveryTestCases,
          generator: makeGenerateLlmConversationData({
            systemMessage: systemPrompt.content,
            chatLlm: makeOpenAiChatLlm({
              deployment: OPENAI_GPT_4_CHAT_COMPLETION_DEPLOYMENT,
              openAiClient: new OpenAIClient(
                OPENAI_ENDPOINT,
                new AzureKeyCredential(OPENAI_API_KEY)
              ),
              openAiLmmConfigOptions: {
                temperature: 0,
                maxTokens: 500,
              },
            }),
          }),
        },
      },
      evaluate: {
        conversationLastMessageMentionsMongoDb: {
          evaluator: makeEvaluateConversationLastMessageIncludesRegex({
            regex: /mongodb/i,
          }),
        },
      },
      report: {
        gpt35_0613_ConversationDiscoveryRun: {
          reporter: reportStatsForBinaryEvalRun,
        },
        gpt4_0124_ConversationDiscoveryRun: {
          reporter: reportStatsForBinaryEvalRun,
        },
      },
    },
    async afterAll() {
      await mongodb.close();
    },
  } satisfies EvalConfig;
  return evalConfig;
};
