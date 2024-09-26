import { Eval, traced, wrapTraced } from "braintrust";
import {
  GenerateDriverCodeParams,
  makeGenerateDriverCode,
  MakeGenerateDriverCodeParams,
} from "./generateDriverCode/makeGenerateDriverCode";
import OpenAI from "openai";
import {
  loadBraintrustEvalCases,
  loadBraintrustMetadata,
} from "./loadBraintrustDatasets";
import {
  TextToDriverExpected,
  TextToDriverInput,
  TextToDriverMetadata,
  TextToDriverOutput,
} from "./evalTypes";
import { SuccessfulExecution } from "./evaluationMetrics";
import { strict as assert } from "assert";
import { executeGeneratedDriverCode } from "./executeGeneratedDriverCode";

export interface MakeEvalParams {
  apiKey: string;
  projectName: string;
  maxConcurrency?: number;
  timeout?: number;
  experimentName: string;
  metadata?: Record<string, unknown>;
  openAiClient: OpenAI;
  promptConfig: Pick<MakeGenerateDriverCodeParams, "sampleGenerationConfig"> & {
    customInstructions: MakeGenerateDriverCodeParams["promptGenerationConfig"]["customInstructions"];
    fewShotExamples?: MakeGenerateDriverCodeParams["promptGenerationConfig"]["fewShotExamples"];
    generateCollectionSchemas: MakeGenerateDriverCodeParams["promptGenerationConfig"]["mongoDb"]["generateCollectionSchemas"];
  };
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
  const dbMetadatas = await loadBraintrustMetadata({
    apiKey,
    projectName,
  });
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
      const metadata = dbMetadatas.find(
        (metadata) => metadata.databaseName === input.dataset_name
      );
      assert(
        metadata,
        `DB Metadata not found for database ${input.dataset_name}`
      );
      assert(
        metadata.collections.length,
        `No collections for database ${metadata.databaseName}`
      );

      const generateCode = await traced(
        async () =>
          makeGenerateDriverCode({
            sampleGenerationConfig: promptConfig.sampleGenerationConfig,
            promptGenerationConfig: {
              customInstructions: promptConfig.customInstructions,
              fewShotExamples: promptConfig.fewShotExamples,
              mongoDb: {
                generateCollectionSchemas:
                  promptConfig.generateCollectionSchemas,
                databaseName: metadata.databaseName,
                collections:
                  metadata.collections as MakeGenerateDriverCodeParams["promptGenerationConfig"]["mongoDb"]["collections"],
              },
            },
          }),
        {
          name: "makeGenerateDriverCode",
        }
      );

      const output = await traced(
        async () =>
          generateCode({
            openAiClient,
            llmOptions,
            userPrompt: input.nl_query,
          }),
        {
          name: "generateDriverCode",
        }
      );

      const execution = await traced(
        async () =>
          executeGeneratedDriverCode({
            generatedDriverCode: output,
            databaseName: metadata.databaseName,
            mongoClient: promptConfig.sampleGenerationConfig.mongoClient,
          }),
        {
          name: "executeGeneratedDriverCode",
        }
      );
      console.log({
        datasetName: input.dataset_name,
        query: input.nl_query,
        output,
        executionOutput: execution,
      });

      return {
        generatedCode: output,
        execution,
      };
    },
    // (EAI-536)TODO: Add fuzzy match metric
    scores: [SuccessfulExecution],
  });
}
