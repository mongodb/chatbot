import {
  EvalConfig,
  makeMongoDbCommandMetadataStore,
  makeMongoDbGeneratedDataStore,
  makeGenerateConversationData,
  getConversationsTestCasesFromYaml,
  makeEvaluateConversationQuality,
  makeMongoDbEvaluationStore,
  makeMongoDbReportStore,
  mongodbResponseQualityExamples,
  reportStatsForBinaryEvalRun,
  makeEvaluateConversationFaithfulness,
  makeGenerateLlmConversationData,
  evaluateConversationAverageRetrievalScore,
  reportAverageScore,
  makeEvaluateConversationRelevancy,
} from "mongodb-chatbot-evaluation";
import {
  makeMongoDbConversationsService,
  makeOpenAiChatLlm,
} from "mongodb-chatbot-server";
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
    CONVERSATIONS_SERVER_BASE_URL,
    OPENAI_CHAT_COMPLETION_DEPLOYMENT,
    OPENAI_ENDPOINT,
    OPENAI_API_KEY,
    OPENAI_GPT_4_CHAT_COMPLETION_DEPLOYMENT,
  } = assertEnvVars(envVars);

  const { OpenAIClient, AzureKeyCredential } = await import("@azure/openai");
  const { OpenAI: LlamaIndexOpenAiLlm } = await import("llamaindex");
  const llamaIndexEvaluationLlm = new LlamaIndexOpenAiLlm({
    azure: {
      apiKey: OPENAI_API_KEY,
      endpoint: OPENAI_ENDPOINT,
      deploymentName: OPENAI_GPT_4_CHAT_COMPLETION_DEPLOYMENT,
    },
  });
  const miscTestCases = getConversationsTestCasesFromYaml(
    fs.readFileSync(
      path.resolve(__dirname, "..", "testCases", "conversations.yml"),
      "utf8"
    )
  );
  const faqTestCases = getConversationsTestCasesFromYaml(
    fs.readFileSync(
      path.resolve(__dirname, "..", "testCases", "faq_conversations.yml"),
      "utf8"
    )
  );
  const allTestCases = [...miscTestCases, ...faqTestCases];
  const biasTestCases = getConversationsTestCasesFromYaml(
    fs.readFileSync(
      path.resolve(__dirname, "..", "testCases", "bias_conversations.yml"),
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
          testCases: allTestCases,
          generator: makeGenerateConversationData({
            conversations,
            httpHeaders: {
              Origin: "Testing",
            },
            apiBaseUrl: CONVERSATIONS_SERVER_BASE_URL,
          }),
        },
        faqConversations: {
          type: "conversation",
          testCases: faqTestCases,
          generator: makeGenerateConversationData({
            conversations,
            httpHeaders: {
              Origin: "Testing",
            },
            apiBaseUrl: CONVERSATIONS_SERVER_BASE_URL,
          }),
        },
        gpt35_0613_Conversations: {
          type: "conversation",
          testCases: allTestCases,
          generator: makeGenerateLlmConversationData({
            systemMessage: systemPrompt.content,
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
        gpt4_0124_Conversations: {
          type: "conversation",
          testCases: allTestCases,
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
        biasConversations: {
          type: "conversation",
          testCases: biasTestCases,
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
            fewShotExamples: mongodbResponseQualityExamples,
          }),
        },
        conversationQualityGpt4: {
          evaluator: makeEvaluateConversationQuality({
            deploymentName: OPENAI_GPT_4_CHAT_COMPLETION_DEPLOYMENT,
            openAiClient: new OpenAIClient(
              OPENAI_ENDPOINT,
              new AzureKeyCredential(OPENAI_API_KEY)
            ),
            fewShotExamples: mongodbResponseQualityExamples,
          }),
        },
        conversationFaithfulness: {
          evaluator: makeEvaluateConversationFaithfulness({
            llamaIndexLlm: llamaIndexEvaluationLlm,
          }),
        },
        conversationRetrievalScore: {
          evaluator: evaluateConversationAverageRetrievalScore,
        },
        conversationAnswerRelevancy: {
          evaluator: makeEvaluateConversationRelevancy({
            llamaIndexLlm: llamaIndexEvaluationLlm,
          }),
        },
      },
      report: {
        conversationQualityRun: {
          reporter: reportStatsForBinaryEvalRun,
        },
        conversationFaithfulnessRun: {
          reporter: reportStatsForBinaryEvalRun,
        },
        gpt35_0613_ConversationQualityRun: {
          reporter: reportStatsForBinaryEvalRun,
        },
        gpt4_0124_ConversationQualityRun: {
          reporter: reportStatsForBinaryEvalRun,
        },
        conversationRetrievalScoreAvg: {
          reporter: reportAverageScore,
        },
        conversationAnswerRelevancyRun: {
          reporter: reportStatsForBinaryEvalRun,
        },
        faqConversationQualityRun: {
          reporter: reportStatsForBinaryEvalRun,
        },
        faqConversationFaithfulnessRun: {
          reporter: reportStatsForBinaryEvalRun,
        },
        faqConversationRetrievalScoreAvg: {
          reporter: reportAverageScore,
        },

        faqConversationAnswerRelevancyRun: {
          reporter: reportStatsForBinaryEvalRun,
        },
        biasConversationQualityRun: {
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
