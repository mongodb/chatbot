import {
  EvalConfig,
  makeMongoDbCommandMetadataStore,
  makeMongoDbGeneratedDataStore,
  makeMongoDbEvaluationStore,
  makeMongoDbReportStore,
  makeEvaluateConversationAnswerRelevanceV2,
  PatronusEvaluatorClient,
  makeEvaluateConversationContextRelevanceV1,
  makeEvaluateConversationHallucinationV2,
  makeEvaluateConversationCustomV1,
  makeEvaluateQuizExactMatchV1,
} from "mongodb-chatbot-evaluation";
import "dotenv/config";
import { MongoClient, assertEnvVars, logger } from "mongodb-rag-core";
import { envVars } from "./envVars";

const timeTag = { runStamp: Date.now().toString() };
export default async () => {
  const { MONGODB_DATABASE_NAME, MONGODB_CONNECTION_URI, PATRONUS_API_KEY } =
    assertEnvVars({ ...envVars, PATRONUS_API_KEY: "" });

  const storeDbOptions = {
    connectionUri: MONGODB_CONNECTION_URI,
    databaseName: MONGODB_DATABASE_NAME,
  };

  const mongodb = new MongoClient(MONGODB_CONNECTION_URI);
  await mongodb.connect();
  const patronusClient = new PatronusEvaluatorClient({
    apiKey: PATRONUS_API_KEY,
  });
  logger.info(timeTag);

  const gpt35Version = {
    version: "gpt-3.5",
    ...timeTag,
  };
  const gpt4oVersion = {
    version: "gpt-4o",
    ...timeTag,
  };
  const discoveryEvalCriteria = "Mentions MongoDB in the response.";
  const evalConfig = {
    metadataStore: makeMongoDbCommandMetadataStore(storeDbOptions),
    generatedDataStore: makeMongoDbGeneratedDataStore(storeDbOptions),
    evaluationStore: makeMongoDbEvaluationStore(storeDbOptions),
    reportStore: makeMongoDbReportStore(storeDbOptions),

    commands: {
      evaluate: {
        gpt35_answer_relevance: {
          evaluator: makeEvaluateConversationAnswerRelevanceV2(
            patronusClient,
            gpt35Version
          ),
          concurrency: 10,
        },
        gpt35_context_relevance: {
          evaluator: makeEvaluateConversationContextRelevanceV1(
            patronusClient,
            gpt35Version
          ),
          concurrency: 10,
        },
        gpt35_context_sufficiency: {
          evaluator: makeEvaluateConversationHallucinationV2(
            patronusClient,
            gpt35Version
          ),
          concurrency: 10,
        },
        gpt4o_answer_relevance: {
          evaluator: makeEvaluateConversationAnswerRelevanceV2(
            patronusClient,
            gpt4oVersion
          ),
          concurrency: 10,
        },
        gpt4o_context_relevance: {
          evaluator: makeEvaluateConversationContextRelevanceV1(
            patronusClient,
            gpt4oVersion
          ),
          concurrency: 10,
        },
        gpt4o_context_sufficiency: {
          evaluator: makeEvaluateConversationHallucinationV2(
            patronusClient,
            gpt4oVersion
          ),
          concurrency: 10,
        },

        // Discovery evals
        gpt35_mongodb_discovery: {
          evaluator: makeEvaluateConversationCustomV1(
            patronusClient,
            discoveryEvalCriteria,
            gpt35Version
          ),
        },
        gpt4o_mongodb_discovery: {
          evaluator: makeEvaluateConversationCustomV1(
            patronusClient,
            discoveryEvalCriteria,
            gpt4oVersion
          ),
        },
        gpt35_quiz_check: {
          evaluator: makeEvaluateQuizExactMatchV1(patronusClient, gpt35Version),
        },
        gpt4o_quiz_check: {
          evaluator: makeEvaluateQuizExactMatchV1(patronusClient, gpt4oVersion),
        },
      },
    },
    async afterAll() {
      logger.info(timeTag);
      await mongodb.close();
    },
  } satisfies EvalConfig;
  return evalConfig;
};
