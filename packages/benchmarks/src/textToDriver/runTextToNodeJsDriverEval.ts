import { traced } from "braintrust";
import {
  GenerateDriverCodeParams,
  makeGenerateDriverCode,
  MakeGenerateDriverCodeParams,
} from "./generateDriverCode/makeGenerateDriverCode";
import { OpenAI } from "mongodb-rag-core/openai";
import {
  loadLegacyTextToDriverBraintrustEvalCases,
  loadBraintrustMetadata,
} from "./loadBraintrustDatasets";
import {
  TextToDriverEvalResult,
  makeTextToDriverEval,
} from "./TextToDriverEval";
import { SuccessfulExecution } from "./evaluationMetrics";
import { strict as assert } from "assert";
import { executeNodeJsDriverCode } from "mongodb-rag-core/executeCode";

export interface MakeTextToDriverEvalParams {
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
  sleepBeforeMs?: number;
}

export async function runTextToNodeJsDriverEval({
  apiKey,
  projectName,
  experimentName,
  openAiClient,
  promptConfig,
  llmOptions,
  metadata,
  maxConcurrency = 3,
  timeout,
  sleepBeforeMs = 0,
  dataset,
}: MakeTextToDriverEvalParams): Promise<TextToDriverEvalResult> {
  const dbMetadatas = await loadBraintrustMetadata({
    apiKey,
    projectName,
  });
  return makeTextToDriverEval({
    apiKey,
    projectName,
    maxConcurrency,
    experimentName,
    timeout,
    metadata,
    data: loadLegacyTextToDriverBraintrustEvalCases({
      apiKey,
      projectName,
      datasetName: dataset.name,
    }),
    task: async (input) => {
      try {
        await sleep(sleepBeforeMs);
        const metadata = dbMetadatas.find(
          (metadata) => metadata.databaseName === input.databaseName
        );
        assert(
          metadata,
          `DB Metadata not found for database ${input.databaseName}`
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
              userPrompt: input.nlQuery,
            }),
          {
            name: "generateDriverCode",
          }
        );

        const execution = await traced(
          async () =>
            executeNodeJsDriverCode({
              generatedDriverCode: output,
              databaseName: metadata.databaseName,
              mongoClient: promptConfig.sampleGenerationConfig.mongoClient,
            }),
          {
            name: "executeGeneratedDriverCode",
          }
        );

        return {
          generatedCode: output,
          execution,
        };
      } catch (error: unknown) {
        console.log(`Error evaluating input: ${input}`);
        console.log(error);
        return {
          generatedCode: "",
          execution: {
            error: {
              message:
                typeof error === "object" && error !== null
                  ? (error as { message: string }).message
                  : "Unknown error",
            },
            executionTimeMs: 0,
            result: null,
          },
        };
      }
    },

    scores: [SuccessfulExecution],
  });
}

async function sleep(timeMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, timeMs));
}
