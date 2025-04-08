import { makeTextToDriverEval } from "../../TextToDriverEval";
import { loadTextToDriverBraintrustEvalCases } from "../../loadBraintrustDatasets";
import { ReasonableOutput, SuccessfulExecution } from "../../evaluationMetrics";
import { makeGenerateMongoshCodeAgenticTask } from "../../generateDriverCode/generateMongoshCodeAgentic";
import { annotatedDbSchemas } from "../../generateDriverCode/annotatedDbSchemas";
import { createOpenAI } from "@ai-sdk/openai";
import { wrapAISDKModel } from "mongodb-rag-core/braintrust";
import {
  BRAINTRUST_API_KEY,
  BRAINTRUST_ENDPOINT,
  DATASET_NAME,
  PROJECT_NAME,
  MONGODB_TEXT_TO_DRIVER_CONNECTION_URI,
  MODELS,
  MAX_CONCURRENT_EXPERIMENTS,
  makeLlmOptions,
} from "./config";
import PromisePool from "@supercharge/promise-pool";

async function main() {
  await PromisePool.for(MODELS)
    .withConcurrency(MAX_CONCURRENT_EXPERIMENTS)
    .process(async (model) => {
      const llmOptions = makeLlmOptions(model);
      const experimentName = `mongosh-benchmark-agentic-${model.label}`;
      console.log(`Running experiment: ${experimentName}`);

      await makeTextToDriverEval({
        apiKey: BRAINTRUST_API_KEY,
        projectName: PROJECT_NAME,
        experimentName,
        data: loadTextToDriverBraintrustEvalCases({
          apiKey: BRAINTRUST_API_KEY,
          projectName: PROJECT_NAME,
          datasetName: DATASET_NAME,
        }),
        maxConcurrency: model.maxConcurrency,

        task: makeGenerateMongoshCodeAgenticTask({
          uri: MONGODB_TEXT_TO_DRIVER_CONNECTION_URI,
          databaseInfos: annotatedDbSchemas,
          llmOptions,
          openai: wrapAISDKModel(
            createOpenAI({
              apiKey: BRAINTRUST_API_KEY,
              baseURL: BRAINTRUST_ENDPOINT,
            }).chat(llmOptions.model, {
              structuredOutputs: true,
            })
          ),
        }),
        metadata: {
          llmOptions,
          model,
        },
        scores: [SuccessfulExecution, ReasonableOutput],
      });
    });
}

main();
