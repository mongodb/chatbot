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
  MAX_CONCURRENT_MODELS,
  schemaStrategies,
  systemPromptStrategies,
  Experiment,
  fewShot,
  EXPERIMENT_BASE_NAME,
} from "./config";
import PromisePool from "@supercharge/promise-pool";
import { getOpenAiEndpointAndApiKey } from "mongodb-rag-core/models";
import { makeGenerateMongoshCodeToolCallTask } from "../../generateDriverCode/generateMongoshCodeToolCall";
import { makeExperimentName } from "../../makeExperimentName";

async function main() {
  const experimentsByModel: Record<
    (typeof MODELS)[number]["label"],
    Experiment[]
  > = {};
  const experimentType = "toolCall";
  for (const model of MODELS) {
    for (const schemaStrategy of schemaStrategies) {
      for (const systemPromptStrategy of systemPromptStrategies) {
        for (const isFewShot of fewShot) {
          experimentsByModel[model.label].push({
            model,
            schemaStrategy,
            systemPromptStrategy,
            type: experimentType,
            fewShot: isFewShot,
          });
        }
      }
    }
  }
  await PromisePool.for(Object.values(experimentsByModel))
    .withConcurrency(MAX_CONCURRENT_MODELS)
    .process(async (experiments) => {
      await PromisePool.for(experiments)
        .withConcurrency(MAX_CONCURRENT_EXPERIMENTS)
        .process(async (experiment) => {
          const { model, schemaStrategy, systemPromptStrategy, fewShot } =
            experiment;
          const llmOptions = makeLlmOptions(model);
          const experimentName = makeExperimentName({
            baseName: EXPERIMENT_BASE_NAME,
            experimentType: experiment.type,
            model: model.label,
            systemPromptStrategy: experiment.systemPromptStrategy,
            schemaStrategy: experiment.schemaStrategy,
            fewShot: experiment.fewShot,
          });
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

            task: makeGenerateMongoshCodeToolCallTask({
              uri: MONGODB_TEXT_TO_DRIVER_CONNECTION_URI,
              databaseInfos: annotatedDbSchemas,
              llmOptions,
              systemPromptStrategy,
              schemaStrategy,
              fewShot,
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
              ...experiment,
            },
            scores: [SuccessfulExecution, ReasonableOutput],
          });
        });
    });
}

main();
