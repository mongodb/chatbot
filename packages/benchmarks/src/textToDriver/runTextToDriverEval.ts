import { Eval, EvalTask, initDataset } from "braintrust";
import {
  GenerateDriverCodeParams,
  makeGenerateDriverCode,
  MakeGenerateDriverCodeParams,
} from "./generateDriverCode/makeGenerateDriverCode";
import { MongoClient } from "mongodb-rag-core";
import OpenAI from "openai";
import { loadBraintrustEvalCases } from "./loadBraintrustDatasets";
import {
  TextToDriverExpected,
  TextToDriverInput,
  TextToDriverMetadata,
  TextToDriverOutput,
} from "./evalTypes";
import { executeGeneratedDriverCode } from "./executeGeneratedDriverCode";

export interface MakeEvalParams {
  apiKey: string;
  projectName: string;
  maxConcurrency?: number;
  timeout?: number;
  experimentName: string;
  metadata?: Record<string, unknown>;
  openAiClient: OpenAI;
  promptConfig: MakeGenerateDriverCodeParams;
  llmOptions: GenerateDriverCodeParams["llmOptions"];
  dataset: {
    name: string;
    version?: string;
  };
}
export async function runTextToDriverEval({
  apiKey,
  projectName,
  experimentName,
  openAiClient,
  promptConfig,
  llmOptions,
  metadata,
  maxConcurrency = 3,
  timeout = 30000,
  dataset,
}: MakeEvalParams) {
  return Eval<
    TextToDriverInput,
    TextToDriverOutput,
    TextToDriverExpected,
    TextToDriverMetadata
  >(projectName, {
    maxConcurrency,
    experimentName,
    timeout,
    metadata,
    data: loadBraintrustEvalCases({
      apiKey,
      projectName,
      datasetName: dataset.name,
    }),

    // TODO: make this a separate tested function
    async task(input) {
      const generateCode = await makeGenerateDriverCode(promptConfig);

      const output = await generateCode({
        openAiClient,
        llmOptions,
        userPrompt: input.nl_query,
      });
      const execution = await executeGeneratedDriverCode({
        generatedDriverCode: output,
        databaseName: input.database_name,
        mongoClient: promptConfig.sampleGenerationConfig.mongoClient,
      });

      return {
        generatedCode: output,
        execution,
      };
    },
    // TODO: add when PR ready...
    // Maybe will be language specific?
    scores: [],
  });
}

export interface GenerateDatabaseQueryParams {
  generatePromptConfig: MakeGenerateDriverCodeParams;
  openAiClient: OpenAI;
  llmOptions: GenerateDriverCodeParams["llmOptions"];
  userPrompt: string;
}
export async function generateDatabaseQuery({
  openAiClient,
  generatePromptConfig,
  userPrompt,
  llmOptions,
}: GenerateDatabaseQueryParams) {
  const generateCode = await makeGenerateDriverCode(generatePromptConfig);

  const output = await generateCode({
    openAiClient,
    llmOptions,
    userPrompt,
  });
  return output;
}
