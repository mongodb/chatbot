import { makeTextToDriverEval } from "../../TextToDriverEval";
import { loadTextToDriverBraintrustEvalCases } from "../../loadBraintrustDatasets";
import { ReasonableOutput, SuccessfulExecution } from "../../evaluationMetrics";
import { annotatedDbSchemas } from "../../generateDriverCode/annotatedDbSchemas";
import { createOpenAI } from "@ai-sdk/openai";
import { wrapAISDKModel } from "mongodb-rag-core/braintrust";
import { makeGenerateMongoshCodeSimpleTask } from "../../generateDriverCode/generateMongoshCodeSimpleToolCall";
import {
  BRAINTRUST_API_KEY,
  DATASET_NAME,
  makeLlmOptions,
  MAX_CONCURRENT_EXPERIMENTS,
  MODELS,
  MONGODB_TEXT_TO_DRIVER_CONNECTION_URI,
  PROJECT_NAME,
} from "./config";
import PromisePool from "@supercharge/promise-pool";
import { getOpenAiEndpointAndApiKey } from "mongodb-rag-core/models";

async function main() {
  await PromisePool.for(MODELS)
    .withConcurrency(MAX_CONCURRENT_EXPERIMENTS)
    .process(async (model) => {
      const llmOptions = makeLlmOptions(model);
      const schemaStrategy = "interpreted";
      const experimentName = `mongosh-benchmark-simple-tool-call-${schemaStrategy}-schema-${model.label}`;
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

        task: makeGenerateMongoshCodeSimpleTask({
          uri: MONGODB_TEXT_TO_DRIVER_CONNECTION_URI,
          databaseInfos: annotatedDbSchemas,
          llmOptions,
          openai: wrapAISDKModel(
            createOpenAI({
              ...(await getOpenAiEndpointAndApiKey(model)),
            }).chat(llmOptions.model, {
              structuredOutputs: true,
            })
          ),
          schemaStrategy,
        }),
        metadata: {
          llmOptions,
          model,
          schemaStrategy,
        },
        scores: [SuccessfulExecution, ReasonableOutput],
      });
    });
}

main();
