import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { BenchmarkConfig } from "../cli/BenchmarkConfig";
import {
  TextToDriverExpected,
  TextToDriverInput,
  TextToDriverMetadata,
  TextToDriverOutput,
} from "./TextToDriverEval";
import { loadTextToDriverBraintrustEvalCases } from "./loadBraintrustDatasets";

import { annotatedDbSchemas } from "./generateDriverCode/annotatedDbSchemas";
import { makeLlmOptions } from "./bin/mongoshBenchmarks/config";
import { BraintrustMiddleware } from "mongodb-rag-core/braintrust";
import { createOpenAI, wrapLanguageModel } from "mongodb-rag-core/aiSdk";
import { makeGenerateMongoshCodeAgenticTask } from "./generateDriverCode/generateMongoshCodeAgentic";
import { makeGenerateAtlasSearchCodeAgenticTask } from "./generateDriverCode/generateAtlasSearchCodeAgentic";
import { atlasSearchPrompt } from "./generateDriverCode/languagePrompts/atlasSearch";
import { MongoClient } from "mongodb-rag-core/mongodb";

export const NL_TO_MONGOSH_PROJECT_NAME = "natural-language-to-atlas-search";

const NL_TO_MONGOSH_DATASET_NAME = "TODO: add";

const mongoClient = new MongoClient(MONGODB_TEXT_TO_DRIVER_CONNECTION_URI);

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
        return makeGenerateAtlasSearchCodeAgenticTask({
          model: wrapLanguageModel({
            model: createOpenAI({
              apiKey: provider.apiKey,
              baseURL: provider.baseUrl,
            }),
            middleware: [BraintrustMiddleware({ debug: true })],
          }),
          systemPrompt: atlasSearchPrompt,
          mongoClient,
          httpMcpServerConnectionUrl: new URL("http://localhost:8080"),
        });
        // TODO: Add afterEval to clean up the database
      },
    },
  },
  scorers: {},
  description: "Natural language to Atlas Search code generation",
};
