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
import { getOpenAiEndpointAndApiKey } from "mongodb-rag-core/models";
import { makeGenerateMongoshCodeToolCallTask } from "../../generateDriverCode/generateMongoshCodeToolCall";
import { makeExperimentName } from "../../makeExperimentName";

async function main() {
  const toolCallModels = MODELS
    // These models don't support tool calling
    .filter((m) => !(m.label.includes("llama") || m.label.includes("mistral")));

  const experimentType = "toolCall";

  // For each model evaluate the following:
  // 1. annotated schema + default system prompt
  // 2. annotated schema + chain of thought system prompt
  // 3. annotated schema + default system prompt + few shot
  // 4. annotated schema + chain of thought system prompt + few shot
  const experiments = toolCallModels.reduce((acc, model) => {
    acc[model.label] = [
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
        systemPromptStrategy: "default",
        type: experimentType,
        model,
        fewShot: true,
      },
      {
        schemaStrategy: "annotated",
        systemPromptStrategy: "chainOfThought",
        type: experimentType,
        model,
        fewShot: true,
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
            scores: [mongoshScores],
          });
        });
    });
}

main();
