import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { BenchmarkConfig } from "../cli/BenchmarkConfig";
import {
  TextToDriverExpected,
  TextToDriverInput,
  TextToDriverMetadata,
  TextToDriverOutput,
} from "./TextToDriverEval";
import { loadTextToDriverBraintrustEvalCases } from "./loadBraintrustDatasets";
import { ReasonableOutput, SuccessfulExecution } from "./evaluationMetrics";
import { annotatedDbSchemas } from "./generateDriverCode/annotatedDbSchemas";
import { makeLlmOptions } from "./bin/mongoshBenchmarks/config";
import { BraintrustMiddleware } from "mongodb-rag-core/braintrust";
import { createOpenAI, wrapLanguageModel } from "mongodb-rag-core/aiSdk";
import { makeGenerateMongoshCodeAgenticTask } from "./generateDriverCode/generateMongoshCodeAgentic";
import { makeGenerateMongoshCodePromptCompletionTask } from "./generateDriverCode/generateMongoshCodePromptCompletion";
import { makeGenerateMongoshCodeToolCallTask } from "./generateDriverCode/generateMongoshCodeToolCall";

export const NL_TO_MONGOSH_PROJECT_NAME = "natural-language-to-atlas-search";

const NL_TO_MONGOSH_DATASET_NAME = "TODO: add";

export const nlToMongoshBenchmarkConfig: BenchmarkConfig<
  TextToDriverInput,
  TextToDriverOutput,
  TextToDriverExpected,
  TextToDriverMetadata
> = {
  projectName: NL_TO_MONGOSH_PROJECT_NAME,
  datasets: {
    atlas_sample_data_benchmark: {
      description:
        "Questions about the Atlas sample data. Synthetically generated with GPT-4o",
      async getDataset() {
        const { BRAINTRUST_API_KEY } = assertEnvVars(BRAINTRUST_ENV_VARS);
        return await loadTextToDriverBraintrustEvalCases({
          apiKey: BRAINTRUST_API_KEY,
          projectName: NL_TO_MONGOSH_PROJECT_NAME,
          datasetName: NL_TO_MONGOSH_DATASET_NAME,
        });
      },
    },
  },
  tasks: {
    agentic: {
      description: "Agentic workflow-based code generation",
      taskFunc: (provider, modelConfig) => {
        const { MONGODB_TEXT_TO_DRIVER_CONNECTION_URI } = assertEnvVars({
          MONGODB_TEXT_TO_DRIVER_CONNECTION_URI: "",
        });
        return makeGenerateMongoshCodeAgenticTask({
          uri: MONGODB_TEXT_TO_DRIVER_CONNECTION_URI,
          databaseInfos: annotatedDbSchemas,
          llmOptions: makeLlmOptions(modelConfig),
          openai: wrapLanguageModel({
            model: createOpenAI({
              apiKey: provider.apiKey,
              baseURL: provider.baseUrl,
            }).chat(modelConfig.deployment),
            middleware: [BraintrustMiddleware({ debug: true })],
          }),
        });
      },
    },
  },
  scorers: {},
  description: "Natural language to Atlas Search code generation",
};
