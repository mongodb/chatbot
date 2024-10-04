import { runTextToDriverEval } from "./runTextToDriverEval";
import { radiantModels } from "../radiantModels";
import { assertEnvVars, MongoClient } from "mongodb-rag-core";
import { NODE_JS_PROMPTS } from "./generateDriverCode/languagePrompts/nodeJs";
import OpenAI, { AzureOpenAI } from "openai";
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
  const maxConcurrency = 3;
  const timeout = 60000;

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
      .withConcurrency(4)
      .process(async (modelInfos) => {
        await PromisePool.for(modelInfos)
          .withConcurrency(1)
          .process(
            async ({ modelInfo, promptType, generateCollectionSchemas }) => {
              runTextToDriverEval({
                dataset: {
                  name: datasetName,
                },
                experimentName: `${modelInfo.label}-${promptType}-${
                  generateCollectionSchemas ? "with" : "without"
                }-collection-schemas`,
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
                maxConcurrency,
                timeout,
                promptConfig: {
                  customInstructions: prompts[promptType],
                  generateCollectionSchemas,
                  sampleGenerationConfig: {
                    mongoClient,
                    limit: SAMPLE_DOCUMENT_LIMIT,
                  },
                },
              });
            }
          );
      });

    await Promise.allSettled(
      radiantModels
        .map((modelInfo) => [
          {
            modelInfo,
            generateCollectionSchemas: true,
          },
          {
            modelInfo,
            generateCollectionSchemas: false,
          },
        ])
        .flat()
        .map(async ({ modelInfo, generateCollectionSchemas }) => {
          const modelEvalPromises = Object.entries(prompts).map(
            async ([promptType, prompt]) => {
              return runTextToDriverEval({
                dataset: {
                  name: datasetName,
                },
                experimentName: `${modelInfo.label}-${promptType}-${
                  generateCollectionSchemas ? "with" : "without"
                }-collection-schemas`,
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
                maxConcurrency,
                timeout,
                promptConfig: {
                  customInstructions: prompt,
                  generateCollectionSchemas,
                  sampleGenerationConfig: {
                    mongoClient,
                    limit: SAMPLE_DOCUMENT_LIMIT,
                  },
                },
              });
            }
          );
          for (const modelEvalPromise of modelEvalPromises) {
            await modelEvalPromise;
          }
        })
    );
  } finally {
    await mongoClient.close();
  }
}
main();
