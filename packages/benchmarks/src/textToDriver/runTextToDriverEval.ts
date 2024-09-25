import { Eval, EvalTask, initDataset } from "braintrust";
import {
  GenerateDriverCodeParams,
  makeGenerateDriverCode,
  MakeGenerateDriverCodeParams,
} from "./generateDriverCode/makeGenerateDriverCode";
import { MongoClient } from "mongodb-rag-core";
import OpenAI from "openai";

export interface MakeEvalParams {
  projectName: string;
  maxConcurrency?: number;
  timeout?: number;
  experimentName: string;
  metadata?: Record<string, unknown>;
  openAiClient: OpenAI;
  llmOptions: GenerateDriverCodeParams["llmOptions"];
  dataset: {
    name: string;
    version?: string;
  };
}
export async function runTextToDriverEval({
  projectName,
  experimentName,
  openAiClient,
  llmOptions,
  metadata,
  maxConcurrency = 3,
  timeout = 30000,
  dataset,
}: MakeEvalParams) {
  return Eval(projectName, {
    maxConcurrency,
    experimentName,
    timeout,
    metadata,
    // TODO: add when PR ready...
    // Maybe will be language specific?
    scores: [],
    data: initDataset({
      dataset: dataset.name,
      project: projectName,
      version: dataset.version,
    }),
    // TODO: make this a separate tested function
    async task(input, hooks) {
      const generateCode = await makeGenerateDriverCode(generatePromptConfig);

      const output = await generateCode({
        openAiClient,
        llmOptions,
        userPrompt,
      });
      return {};
    },
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
