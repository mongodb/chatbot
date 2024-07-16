import {
  EvalConfig,
  makeMongoDbCommandMetadataStore,
  makeMongoDbGeneratedDataStore,
  makeMongoDbEvaluationStore,
  makeMongoDbReportStore,
  makeEvaluateAnswerRelevanceV2,
  PatronusEvaluatorClient,
  makeEvaluateContextRelevanceV1,
  makeEvaluateHallucinationV2,
} from "mongodb-chatbot-evaluation";
import "dotenv/config";
import { MongoClient, assertEnvVars, logger } from "mongodb-rag-core";
import { envVars } from "./envVars";

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
  const timeTag = { runStamp: Date.now().toString() };
  logger.info(timeTag);

  const gpt35Version = {
    version: "gpt-3.5",
    ...timeTag,
  };
  const gpt4oVersion = {
    version: "gpt-4o",
    ...timeTag,
  };
  const evalConfig = {
    metadataStore: makeMongoDbCommandMetadataStore(storeDbOptions),
    generatedDataStore: makeMongoDbGeneratedDataStore(storeDbOptions),
    evaluationStore: makeMongoDbEvaluationStore(storeDbOptions),
    reportStore: makeMongoDbReportStore(storeDbOptions),

    commands: {
      evaluate: {
        gpt35_answer_relevance: {
          evaluator: makeEvaluateAnswerRelevanceV2(
            patronusClient,
            gpt35Version
          ),
          concurrency: 10,
        },
        gpt35_context_relevance: {
          evaluator: makeEvaluateContextRelevanceV1(
            patronusClient,
            gpt35Version
          ),
          concurrency: 10,
        },
        gpt35_context_sufficiency: {
          evaluator: makeEvaluateHallucinationV2(patronusClient, gpt35Version),
          concurrency: 10,
        },
        gpt4o_answer_relevance: {
          evaluator: makeEvaluateAnswerRelevanceV2(
            patronusClient,
            gpt4oVersion
          ),
          concurrency: 10,
        },
        gpt4o_context_relevance: {
          evaluator: makeEvaluateContextRelevanceV1(
            patronusClient,
            gpt4oVersion
          ),
          concurrency: 10,
        },
        gpt4o_context_sufficiency: {
          evaluator: makeEvaluateHallucinationV2(patronusClient, gpt4oVersion),
          concurrency: 10,
        },
      },
    },
    async afterAll() {
      await mongodb.close();
    },
  } satisfies EvalConfig;
  return evalConfig;
};
