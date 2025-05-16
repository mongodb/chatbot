import { runTextToDriverEval } from "./runTextToDriverEval";
import { assertEnvVars } from "mongodb-rag-core";
import { MongoClient } from "mongodb-rag-core/mongodb";
import { NODE_JS_PROMPTS } from "./generateDriverCode/languagePrompts/nodeJs";
import { TEXT_TO_DRIVER_ENV_VARS } from "./TextToDriverEnvVars";
import { BRAINTRUST_ENV_VARS } from "../envVars";

import { OpenAI } from "mongodb-rag-core/openai";
import "dotenv/config";
import { practicalAggregationsSummary } from "./generateDriverCode/practicalAggregationsSummary";
async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function main() {
  const {
    BRAINTRUST_API_KEY,
    BRAINTRUST_TEXT_TO_DRIVER_PROJECT_NAME,
    MONGODB_TEXT_TO_DRIVER_CONNECTION_URI,
  } = assertEnvVars({
    ...TEXT_TO_DRIVER_ENV_VARS,
    ...BRAINTRUST_ENV_VARS,
  });
  const projectName = BRAINTRUST_TEXT_TO_DRIVER_PROJECT_NAME;
  const datasetName = "text-to-query-results";
  const DEFAULT_MAX_CONCURRENCY = 6;

  const prompts = NODE_JS_PROMPTS.systemPrompts;
  const mongoClient = new MongoClient(MONGODB_TEXT_TO_DRIVER_CONNECTION_URI);

  const SAMPLE_DOCUMENT_LIMIT = 2;

  const { RUN_ID } = process.env;

  const experimentName = "o3-mini-generic-few-shot-without-schemas";

  try {
    await mongoClient.connect();
    await sleep(500);

    await runTextToDriverEval({
      dataset: {
        name: datasetName,
      },
      experimentName,
      metadata: {
        sampleDocumentLimit: SAMPLE_DOCUMENT_LIMIT,
        RUN_ID,
      },
      llmOptions: {
        model: "o3-mini",
        // temperature: 0.0,
        max_completion_tokens: 2000,
      },

      projectName,
      apiKey: BRAINTRUST_API_KEY,
      openAiClient: new OpenAI({
        apiKey: process.env.OPENAI_OPENAI_API_KEY,
      }),
      maxConcurrency: DEFAULT_MAX_CONCURRENCY,
      promptConfig: {
        customInstructions: prompts.genericFewShot,
        //  +
        // "\n Also use this reference information for any aggregations that you make" +
        // practicalAggregationsSummary,
        generateCollectionSchemas: false,
        sampleGenerationConfig: {
          mongoClient,
          limit: SAMPLE_DOCUMENT_LIMIT,
        },
      },
    });
  } finally {
    await mongoClient.close();
  }
}
main();
