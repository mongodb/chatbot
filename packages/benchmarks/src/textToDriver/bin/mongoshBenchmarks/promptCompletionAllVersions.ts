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
import { SystemPromptStrategy } from "../../generateDriverCode/generateMongoshCodePromptCompletion";
import { SchemaStrategy } from "../../generateDriverCode/makeDatabaseInfoPrompt";

async function main() {
  const schemaStrategies: SchemaStrategy[] = [
    "annotated",
    "interpreted",
    "none",
  ];
  const systemPromptStrategies: SystemPromptStrategy[] = [
    "default",
    "chainOfThought",
    "lazy",
  ];
  interface Experiment {
    model: (typeof MODELS)[number];
    schemaStrategy: SchemaStrategy;
    systemPromptStrategy: SystemPromptStrategy;
  }
  const experiments: Experiment[] = [];
  for (const model of MODELS) {
    for (const schemaStrategy of schemaStrategies) {
      for (const systemPromptStrategy of systemPromptStrategies) {
        experiments.push({
          model,
          schemaStrategy,
          systemPromptStrategy,
        });
      }
    }
  }
  await PromisePool.for(experiments)
    .withConcurrency(MAX_CONCURRENT_EXPERIMENTS)
    .process(async ({ model, schemaStrategy, systemPromptStrategy }) => {
      const llmOptions = makeLlmOptions(model);
      const experimentName = `mongosh-benchmark-prompt-completion-${systemPromptStrategy}-${schemaStrategy}-schema-${model.label}`;
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
          model,
          systemPromptStrategy,
          schemaStrategy,
        },
        scores: [SuccessfulExecution, ReasonableOutput],
      });
    });
}

main();
