import { runTextToDriverEval } from "./runTextToDriverEval";
import { radiantModels } from "../radiantModels";
import { assertEnvVars, MongoClient } from "mongodb-rag-core";
import { NODE_JS_PROMPTS } from "./generateDriverCode/languagePrompts/nodeJs";
import OpenAI from "openai";
import { TEXT_TO_DRIVER_ENV_VARS } from "./TextToDriverEnvVars";
import { RADIANT_ENV_VARS } from "../envVars";
import { wrapOpenAI } from "braintrust";
import PromisePool from "@supercharge/promise-pool";
async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function main() {
  const {
    BRAINTRUST_API_KEY,
    BRAINTRUST_TEXT_TO_DRIVER_PROJECT_NAME,
    MONGODB_TEXT_TO_DRIVER_CONNECTION_URI,
    RADIANT_API_KEY,
    RADIANT_ENDPOINT,
    MONGODB_AUTH_COOKIE,
  } = assertEnvVars({ ...TEXT_TO_DRIVER_ENV_VARS, ...RADIANT_ENV_VARS });
  const projectName = BRAINTRUST_TEXT_TO_DRIVER_PROJECT_NAME;
  const datasetName = "text-to-query-results";
  const DEFAULT_MAX_CONCURRENCY = 3;

  const prompts = NODE_JS_PROMPTS.systemPrompts;
  const mongoClient = new MongoClient(MONGODB_TEXT_TO_DRIVER_CONNECTION_URI);

  const SAMPLE_DOCUMENT_LIMIT = 2;

  try {
    await mongoClient.connect();
    await sleep(500);
    const modelExperiments = radiantModels.map((modelInfo) => {
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
      .withConcurrency(1)
      .process(async (modelInfos) => {
        await PromisePool.for(modelInfos)
          .withConcurrency(1)
          .process(
            async ({ modelInfo, promptType, generateCollectionSchemas }) => {
              const experimentName = `${modelInfo.label}-${promptType}-${
                generateCollectionSchemas ? "with" : "without"
              }-collection-schemas`;
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
                  },
                  llmOptions: {
                    model: modelInfo.radiantModelDeployment,
                    temperature: 0.0,
                    max_tokens: 1000,
                  },

                  projectName,
                  apiKey: BRAINTRUST_API_KEY,
                  openAiClient: wrapOpenAI(
                    new OpenAI({
                      baseURL: RADIANT_ENDPOINT,
                      apiKey: RADIANT_API_KEY,
                      defaultHeaders: {
                        Cookie: MONGODB_AUTH_COOKIE,
                      },
                    })
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
