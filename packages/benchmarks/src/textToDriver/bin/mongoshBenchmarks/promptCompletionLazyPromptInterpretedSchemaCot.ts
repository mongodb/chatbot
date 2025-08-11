import { makeTextToDriverEval } from "../../TextToDriverEval";
import { loadTextToDriverBraintrustEvalCases } from "../../loadBraintrustDatasets";
import { annotatedDbSchemas } from "../../generateDriverCode/annotatedDbSchemas";
import { createOpenAI, wrapLanguageModel } from "mongodb-rag-core/aiSdk";
import { BraintrustMiddleware } from "mongodb-rag-core/braintrust";
import {
  BRAINTRUST_API_KEY,
  DATASET_NAME,
  PROJECT_NAME,
  MONGODB_TEXT_TO_DRIVER_CONNECTION_URI,
  makeLlmOptions,
  MAX_CONCURRENT_EXPERIMENTS,
  MODELS,
  EXPERIMENT_BASE_NAME,
  Experiment,
  mongoshScores,
} from "./config";
import PromisePool from "@supercharge/promise-pool";
import { makeGenerateMongoshCodePromptCompletionTask } from "../../generateDriverCode/generateMongoshCodePromptCompletion";
import { getOpenAiEndpointAndApiKey } from "mongodb-rag-core/models";
import { makeExperimentName } from "../../makeExperimentName";

async function main() {
  await PromisePool.for(MODELS)
    .withConcurrency(MAX_CONCURRENT_EXPERIMENTS)
    .process(async (model) => {
      const llmOptions = makeLlmOptions(model);
      const experiment: Experiment = {
        model,
        schemaStrategy: "interpreted",
        systemPromptStrategy: "lazy",
        type: "promptCompletion",
      };
      const experimentName = makeExperimentName({
        baseName: EXPERIMENT_BASE_NAME,
        experimentType: experiment.type,
        model: model.label,
        systemPromptStrategy: experiment.systemPromptStrategy,
        schemaStrategy: experiment.schemaStrategy,
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
          openai: wrapLanguageModel({
            model: createOpenAI({
              ...(await getOpenAiEndpointAndApiKey(model)),
            }).chat(llmOptions.model),
            middleware: [BraintrustMiddleware({ debug: true })],
          }),
          systemPromptStrategy: experiment.systemPromptStrategy,
          schemaStrategy: experiment.schemaStrategy,
        }),
        metadata: {
          llmOptions,
          ...experiment,
        },
        scores: [mongoshScores],
      });
    });
}

main();
