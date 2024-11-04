import { runTextToDriverEval } from "./runTextToDriverEval";
import { models } from "../models";
import {
  assertEnvVars,
  CORE_OPENAI_CONNECTION_ENV_VARS,
  MongoClient,
} from "mongodb-rag-core";
import { NODE_JS_PROMPTS } from "./generateDriverCode/languagePrompts/nodeJs";
import { TEXT_TO_DRIVER_ENV_VARS } from "./TextToDriverEnvVars";
import { BRAINTRUST_ENV_VARS, RADIANT_ENV_VARS } from "../envVars";
import { wrapOpenAI } from "braintrust";
import PromisePool from "@supercharge/promise-pool";
import { makeOpenAiClientFactory } from "../makeOpenAiClientFactory";
async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function main() {
  const {
    BRAINTRUST_API_KEY,
    BRAINTRUST_TEXT_TO_DRIVER_PROJECT_NAME,
    BRAINTRUST_ENDPOINT,
    MONGODB_TEXT_TO_DRIVER_CONNECTION_URI,
    RADIANT_API_KEY,
    RADIANT_ENDPOINT,
    MONGODB_AUTH_COOKIE,
    OPENAI_API_KEY,
    OPENAI_ENDPOINT,
    OPENAI_API_VERSION,
  } = assertEnvVars({
    ...TEXT_TO_DRIVER_ENV_VARS,
    ...RADIANT_ENV_VARS,
    ...BRAINTRUST_ENV_VARS,
    ...CORE_OPENAI_CONNECTION_ENV_VARS,
  });
  const projectName = BRAINTRUST_TEXT_TO_DRIVER_PROJECT_NAME;
  const datasetName = "text-to-query-results";
  const DEFAULT_MAX_CONCURRENCY = 3;
  const openAiClientFactory = makeOpenAiClientFactory({
    azure: {
      apiKey: OPENAI_API_KEY,
      apiVersion: OPENAI_API_VERSION,
      endpoint: OPENAI_ENDPOINT,
    },
    radiant: {
      apiKey: RADIANT_API_KEY,
      endpoint: RADIANT_ENDPOINT,
      authCookie: MONGODB_AUTH_COOKIE,
    },
    braintrust: {
      apiKey: BRAINTRUST_API_KEY,
      endpoint: BRAINTRUST_ENDPOINT,
    },
  });

  const prompts = NODE_JS_PROMPTS.systemPrompts;
  const mongoClient = new MongoClient(MONGODB_TEXT_TO_DRIVER_CONNECTION_URI);

  const SAMPLE_DOCUMENT_LIMIT = 2;

  const { RUN_ID } = process.env;

  try {
    await mongoClient.connect();
    await sleep(500);
    const modelExperiments = models

      .filter((m) => m.authorized === true)
      // // NOTE: ignoring Google models for now b/c of issues with Radiant
      .filter((m) => m.developer !== "Google")
      .map((modelInfo) => {
        const modelExperiments = [];
        for (const promptType of Object.keys(prompts)) {
          for (const generateCollectionSchemas of [true, false]) {
            modelExperiments.push({
              modelInfo,
              promptType,
              generateCollectionSchemas,
            });
          }
        }
        return modelExperiments;
      });
    // Process models in parallel
    await PromisePool.for(modelExperiments)
      .withConcurrency(3)
      .process(async (modelInfos) => {
        await PromisePool.for(modelInfos.slice(4))
          .withConcurrency(1)
          .process(
            async ({ modelInfo, promptType, generateCollectionSchemas }) => {
              const experimentName = `${modelInfo.label}-${promptType}-${
                generateCollectionSchemas ? "with" : "without"
              }-collection-schemas${RUN_ID ? `-${RUN_ID}` : ""}`;
              console.log(`Running experiment: ${experimentName}`);
              try {
                await runTextToDriverEval({
                  dataset: {
                    name: datasetName,
                  },
                  experimentName,
                  metadata: {
                    ...modelInfo,
                    promptStrategy: promptType,
                    generateCollectionSchemas,
                    sampleDocumentLimit: SAMPLE_DOCUMENT_LIMIT,
                    RUN_ID,
                  },
                  llmOptions: {
                    model: modelInfo.deployment,
                    temperature: 0.0,
                    max_tokens: 1000,
                  },

                  projectName,
                  apiKey: BRAINTRUST_API_KEY,
                  openAiClient: wrapOpenAI(
                    openAiClientFactory.makeOpenAiClient(modelInfo)
                  ),
                  maxConcurrency:
                    modelInfo.maxConcurrency ?? DEFAULT_MAX_CONCURRENCY,
                  sleepBeforeMs: modelInfo.sleepBeforeMs,
                  promptConfig: {
                    customInstructions: prompts[promptType],
                    generateCollectionSchemas,
                    sampleGenerationConfig: {
                      mongoClient,
                      limit: SAMPLE_DOCUMENT_LIMIT,
                    },
                  },
                });
              } catch (err) {
                console.error("Error running Braintrust");
                console.error(err);
              }
            }
          );
      });
  } finally {
    await mongoClient.close();
  }
}
main();
