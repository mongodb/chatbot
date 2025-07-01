import { makeTextToDriverEval } from "../../TextToDriverEval";
import { loadTextToDriverBraintrustEvalCases } from "../../loadBraintrustDatasets";
import { makeGenerateMongoshCodeAgenticTask } from "../../generateDriverCode/generateMongoshCodeAgentic";
import { annotatedDbSchemas } from "../../generateDriverCode/annotatedDbSchemas";
import { createOpenAI } from "@ai-sdk/openai";
import { wrapAISDKModel } from "mongodb-rag-core/braintrust";
import {
  BRAINTRUST_API_KEY,
  DATASET_NAME,
  PROJECT_NAME,
  MONGODB_TEXT_TO_DRIVER_CONNECTION_URI,
  MODELS,
  MAX_CONCURRENT_EXPERIMENTS,
  makeLlmOptions,
  EXPERIMENT_BASE_NAME,
  mongoshScores,
} from "./config";
import PromisePool from "@supercharge/promise-pool";
import { getOpenAiEndpointAndApiKey } from "mongodb-rag-core/models";
import { makeExperimentName } from "../../makeExperimentName";

async function main() {
  const experimentType = "agentic";
  await PromisePool.for(
    MODELS
      // these models don't support tool calls. filtering out.
      .filter((m) => !m.label.includes("llama") || m.label.includes("mistral"))
  )
    .withConcurrency(MAX_CONCURRENT_EXPERIMENTS)
    .process(async (model) => {
      const llmOptions = makeLlmOptions(model);
      const experimentName = makeExperimentName({
        baseName: EXPERIMENT_BASE_NAME,
        experimentType,
        model: model.label,
      });
      console.log(`Running experiment: ${experimentName}`);

      await makeTextToDriverEval({
        apiKey: BRAINTRUST_API_KEY,
        projectName: PROJECT_NAME,
        experimentName,
        data: await loadTextToDriverBraintrustEvalCases({
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
              ...(await getOpenAiEndpointAndApiKey(model)),
            }).chat(llmOptions.model, {
              structuredOutputs: true,
            })
          ),
        }),
        metadata: {
          llmOptions,
          model,
          experimentType,
        },
        scores: [mongoshScores],
      });
    });
}

main();
