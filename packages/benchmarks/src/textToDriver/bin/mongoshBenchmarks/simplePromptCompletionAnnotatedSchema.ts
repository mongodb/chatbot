import { makeTextToDriverEval } from "../../TextToDriverEval";
import { loadTextToDriverBraintrustEvalCases } from "../../loadBraintrustDatasets";
import { ReasonableOutput, SuccessfulExecution } from "../../evaluationMetrics";
import { annotatedDbSchemas } from "../../generateDriverCode/annotatedDbSchemas";
import { createOpenAI } from "@ai-sdk/openai";
import { wrapAISDKModel } from "mongodb-rag-core/braintrust";
import {
  BRAINTRUST_API_KEY,
  DATASET_NAME,
  PROJECT_NAME,
  MONGODB_TEXT_TO_DRIVER_CONNECTION_URI,
  makeLlmOptions,
  MAX_CONCURRENT_EXPERIMENTS,
  MODELS,
} from "./config";
import PromisePool from "@supercharge/promise-pool";
import { makeGenerateMongoshCodePromptCompletionTask } from "../../generateDriverCode/generateMongoshCodePromptCompletion";
import { getOpenAiEndpointAndApiKey } from "mongodb-rag-core/models";

async function main() {
  await PromisePool.for(MODELS)
    .withConcurrency(MAX_CONCURRENT_EXPERIMENTS)
    .process(async (model) => {
      const llmOptions = makeLlmOptions(model);
      const chainOfThought = false;
      const schemaStrategy = "annotated";
      const experimentName = `mongosh-benchmark-simple-prompt-completion-${schemaStrategy}-schema-${model.label}`;
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

        task: makeGenerateMongoshCodePromptCompletionTask({
          uri: MONGODB_TEXT_TO_DRIVER_CONNECTION_URI,
          databaseInfos: annotatedDbSchemas,
          llmOptions,
          chainOfThought,
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
        },
        scores: [SuccessfulExecution, ReasonableOutput],
      });
    });
}

main();
