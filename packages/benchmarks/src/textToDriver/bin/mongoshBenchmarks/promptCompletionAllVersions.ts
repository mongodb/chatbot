import { makeTextToDriverEval } from "../../TextToDriverEval";
import { loadTextToDriverBraintrustEvalCases } from "../../loadBraintrustDatasets";
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
  Experiment,
  EXPERIMENT_BASE_NAME,
  mongoshScores,
} from "./config";
import PromisePool from "@supercharge/promise-pool";
import { makeGenerateMongoshCodePromptCompletionTask } from "../../generateDriverCode/generateMongoshCodePromptCompletion";
import { getOpenAiEndpointAndApiKey } from "mongodb-rag-core/models";
import { makeExperimentName } from "../../makeExperimentName";

async function main() {
  const experimentType = "promptCompletion";
  // For each model evaluate the following:
  // 1. interpreted schema + default system prompt
  // 2. interpreted schema + chain of thought system prompt
  // 3. interpreted schema + lazy system prompt
  // 4. annotated schema + default system prompt
  // 5. annotated schema + chain of thought system prompt
  // 6. annotated schema + lazy system prompt
  // 7. no schema + lazy system prompt
  const experiments = MODELS.reduce((acc, model) => {
    acc[model.label] = [
      {
        schemaStrategy: "interpreted",
        systemPromptStrategy: "default",
        type: experimentType,
        model,
      },
      {
        schemaStrategy: "interpreted",
        systemPromptStrategy: "chainOfThought",
        type: experimentType,
        model,
      },
      {
        schemaStrategy: "interpreted",
        systemPromptStrategy: "lazy",
        type: experimentType,
        model,
      },
      {
        schemaStrategy: "annotated",
        systemPromptStrategy: "default",
        type: experimentType,
        model,
      },
      {
        schemaStrategy: "annotated",
        systemPromptStrategy: "chainOfThought",
        type: experimentType,
        model,
      },
      {
        schemaStrategy: "annotated",
        systemPromptStrategy: "lazy",
        type: experimentType,
        model,
      },
      {
        schemaStrategy: "none",
        systemPromptStrategy: "lazy",
        type: experimentType,
        model,
      },
    ];
    return acc;
  }, {} as Record<(typeof MODELS)[number]["label"], Experiment[]>);

  await PromisePool.for(Object.values(experiments))
    .withConcurrency(MAX_CONCURRENT_MODELS)
    .process(async (experiments) => {
      await PromisePool.for(experiments)
        .withConcurrency(MAX_CONCURRENT_EXPERIMENTS)
        .process(async (experiment) => {
          const { model, schemaStrategy, systemPromptStrategy, type } =
            experiment;
          const llmOptions = makeLlmOptions(model);
          const experimentName = makeExperimentName({
            baseName: EXPERIMENT_BASE_NAME,
            experimentType: type,
            model: model.label,
            systemPromptStrategy,
            schemaStrategy,
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

            task: makeGenerateMongoshCodePromptCompletionTask({
              uri: MONGODB_TEXT_TO_DRIVER_CONNECTION_URI,
              databaseInfos: annotatedDbSchemas,
              llmOptions,
              systemPromptStrategy,
              schemaStrategy,
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
            scores: [mongoshScores],
          });
        });
    });
}

main();
