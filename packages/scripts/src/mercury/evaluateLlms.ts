import path from "path";
import fs from "fs";
import os from "os";
import { PromisePool } from "@supercharge/promise-pool";
import { getEnv } from "mongodb-rag-core";
import {
  type ModelMessage,
  createOpenAI,
  generateText,
} from "mongodb-rag-core/aiSdk";
import { MongoClient, ObjectId } from "mongodb-rag-core/mongodb";
import { OpenAI } from "mongodb-rag-core/openai";
import { type PromptResponseRating } from "mercury-case-analysis";
import { makeReferenceAlignment } from "benchmarks";
import { GenerationFailedError, ScoringFailedError } from "./errors";
import { getModel, getModels, getModelDeployment } from "./models";
import { diffLists, truncateString } from "./utils";
import {
  makeMercuryDatabase,
  MercuryDatabase,
  MercuryResult,
} from "./database";
import { ModelConfig } from "mongodb-rag-core/models";

const env = getEnv({
  required: [
    "MERCURY_CONNECTION_URI",
    "BRAINTRUST_PROXY_ENDPOINT",
    "BRAINTRUST_API_KEY",
  ],
  optional: {
    MERCURY_DATABASE_NAME: "docs-chatbot-dev",
    MERCURY_PROMPTS_COLLECTION: "llm_cases_new",
    MERCURY_RESULTS_COLLECTION: "llm_results_new",
    BATCH_SIZE: "50",
  },
});

export const testModelConfigs = getModels([
  // OpenAI
  "gpt-5",
  "gpt-5-mini",
  "gpt-5-nano",
  "gpt-4o",
  "gpt-4o-mini",
  "o3",
  "o3-mini",
  "o4-mini",
  "gpt-4.1",
  "gpt-4.1-mini",
  "gpt-4.1-nano",
  // Anthropic
  "claude-opus-4",
  "claude-sonnet-4",
  "claude-37-sonnet",
  "claude-35-sonnet-v2",
  "claude-35-sonnet",
  "claude-35-haiku",
  // Meta
  "llama-3.1-70b",
  "llama-3.2-90b",
  "llama-3.3-70b",
  // Google
  "gemini-2.0-flash-lite-001",
  "gemini-2-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  // Amazon
  "nova-micro-v1:0",
  "nova-lite-v1:0",
  "nova-pro-v1:0",
  // Mistral
  "mistral-large-2",
]);

const judgementModelConfig = getModel("gpt-4.1");

// Helper function to split an array into batches
function createBatches<T>(array: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  return batches;
}

const scoreReferenceAlignment = makeReferenceAlignment(
  new OpenAI({
    baseURL: env.BRAINTRUST_PROXY_ENDPOINT,
    apiKey: env.BRAINTRUST_API_KEY,
  }),
  {
    model: judgementModelConfig.deployment,
    temperature: 0,
  },
  judgementModelConfig.label
);

async function main(args: { outputDir: string }) {
  const db = makeMercuryDatabase({
    connectionUri: env.MERCURY_CONNECTION_URI,
    databaseName: env.MERCURY_DATABASE_NAME,
    promptsCollectionName: env.MERCURY_PROMPTS_COLLECTION,
    resultsCollectionName: env.MERCURY_RESULTS_COLLECTION,
  });
  try {
    await db.connect();
    // Fetch all of the prompts that we want to test
    const prompts = await db.promptsCollection.find({}).toArray();
    // Determine which prompt-model pairs we want results for
    const promptModelPairsToTest = prompts.flatMap((prompt) => {
      return testModelConfigs.map((model) => {
        return {
          promptId: prompt._id,
          model: model.label,
          developer: model.developer,
        };
      });
    });
    // Determine which prompt-model pairs we already have results for
    const existingResults = await db.resultsCollection
      .find({
        promptId: { $in: prompts.map((p) => p._id) },
      })
      .toArray();
    const existingPromptModelPairs = existingResults.map((r) => {
      return {
        promptId: r.promptId,
        model: r.model,
        developer: r.developer,
      };
    });
    // Diff the two sets to get the prompt-model pairs that we need to test
    const promptModelPairs = diffLists<
      { promptId: ObjectId; model: string; developer: string },
      { promptId: string; model: string; developer: string }
    >(promptModelPairsToTest, existingPromptModelPairs).map(
      ({ promptId, model, developer }) => {
        const prompt = prompts.find((p) => p._id.toString() === promptId);
        if (!prompt) {
          throw new Error(`Prompt ${promptId} not found`);
        }
        return {
          prompt,
          model,
          developer,
          deployment: getModelDeployment(model),
        };
      }
    );
    // Process prompt-model pairs in batches
    const batchSize = parseInt(env.BATCH_SIZE);
    const batches = createBatches(promptModelPairs, batchSize);

    console.log(
      `Processing ${promptModelPairs.length} prompt-model pairs in ${batches.length} batches of size ${batchSize}`
    );

    const allErrors: Error[] = [];
    const allResults: MercuryResult[] = [];

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(
        `\n--- Processing batch ${batchIndex + 1}/${batches.length} (${
          batch.length
        } pairs) ---`
      );

      const batchErrors: Error[] = [];
      const { results: batchResults } = await PromisePool.for(batch)
        .withConcurrency(10)
        .handleError((error) => {
          batchErrors.push(error);
        })
        .process(async ({ prompt, model, deployment, developer }) => {
          const truncatedPrompt = truncateString(prompt.name, 40);
          console.log(
            `Processing: { "prompt": "${truncatedPrompt}", "model": "${model}", "deployment": "${deployment}" }`
          );
          let generatedResponse: Awaited<ReturnType<typeof generateText>>;
          try {
            generatedResponse = await generateText({
              model: createOpenAI({
                baseURL: env.BRAINTRUST_PROXY_ENDPOINT,
                apiKey: env.BRAINTRUST_API_KEY,
              }).chat(deployment),
              messages: prompt.prompt,
            });
          } catch (error) {
            throw new GenerationFailedError({
              prompt,
              model,
              error: error instanceof Error ? error : new Error(String(error)),
            });
          }

          const scorerArgs = {
            input: {
              messages: prompt.prompt as [{ role: "user"; content: string }],
            },
            output: { response: generatedResponse.text },
            expected: { reference: prompt.expected, links: [] },
            metadata: {
              model: model,
              temperature: 0,
            },
          };
          try {
            const score = await scoreReferenceAlignment(scorerArgs);
            const result: MercuryResult = {
              _id: new ObjectId(),
              promptId: prompt._id,
              model,
              developer,
              provider: developer,
              date: new Date(),
              prompt: prompt.name,
              response: generatedResponse.text,
              metrics: {
                referenceAlignment: {
                  score: score.score ?? -1,
                  label:
                    mapReferenceAlignmentScoreToTag(score.score) ?? undefined,
                  rationale:
                    (score.metadata?.rationale as string | undefined) ??
                    undefined,
                },
              },
            };
            return result;
          } catch (error) {
            throw new ScoringFailedError({
              prompt,
              model,
              scorer: scorerArgs,
              error: error instanceof Error ? error : new Error(String(error)),
            });
          }
        });

      // Upload batch results to MongoDB immediately
      if (batchResults.length > 0) {
        console.log(
          `Uploading ${batchResults.length} results from batch ${
            batchIndex + 1
          } to Mercury`
        );
        await db.resultsCollection.insertMany(batchResults);
      }

      // Add to cumulative totals
      allErrors.push(...batchErrors);
      allResults.push(...batchResults);

      // Log batch completion
      const batchGenerationErrors = batchErrors.filter(
        (e) => e instanceof GenerationFailedError
      ).length;
      const batchScoringErrors = batchErrors.filter(
        (e) => e instanceof ScoringFailedError
      ).length;

      console.log(`Batch ${batchIndex + 1} completed:`);
      console.log(`  - Successfully scored: ${batchResults.length} prompts`);
      console.log(
        `  - Failed: ${batchErrors.length} prompts (${batchGenerationErrors} generation, ${batchScoringErrors} scoring errors)`
      );
      console.log(
        `  - Cumulative total: ${allResults.length} successful, ${allErrors.length} failed`
      );
    }

    // Final summary
    console.log(`\n=== Final Summary ===`);
    console.log(`Successfully scored ${allResults.length} prompts`);

    const numGenerationErrors = allErrors.filter(
      (e) => e instanceof GenerationFailedError
    ).length;
    const numScoringErrors = allErrors.filter(
      (e) => e instanceof ScoringFailedError
    ).length;
    console.log(
      `Failed to score ${allErrors.length} prompts\n  - ${numGenerationErrors} generation errors\n  - ${numScoringErrors} scoring errors`
    );

    const { errorsFile, resultsFile } = createOutputs({
      outputDir: args.outputDir,
      errors: allErrors,
      results: allResults,
    });
    console.log("Errors written to", errorsFile);
    console.log("Results written to", resultsFile);
  } finally {
    await db.disconnect();
  }
}

function createOutputs(args: {
  outputDir: string;
  errors: unknown[];
  results: unknown[];
}) {
  const dir = path.join(args.outputDir, Date.now().toString());
  fs.mkdirSync(dir, { recursive: true });
  const errorsFile = path.join(dir, "errors.json");
  fs.writeFileSync(errorsFile, JSON.stringify(args.errors, null, 2));
  const resultsFile = path.join(dir, "results.json");
  fs.writeFileSync(resultsFile, JSON.stringify(args.results, null, 2));
  return {
    errorsFile,
    resultsFile,
  };
}

main({
  outputDir: path.join(os.homedir(), `/Desktop/mercury-results`),
});

export type ReferenceAlignmentTag =
  | "Mismatch"
  | "Subset"
  | "Superset"
  | "Match";

export function mapReferenceAlignmentScoreToTag(
  score: number | null
): ReferenceAlignmentTag | null {
  if (score === null) {
    return null;
  }
  switch (score) {
    case 0:
      return "Mismatch";
    case 0.4:
    case 0.75:
      return "Subset";
    case 0.6:
    case 0.8:
    case 0.9:
      return "Superset";
    case 1:
      return "Match";
    default:
      return null;
  }
}

export async function getPromptModelPairs(args: {
  db: MercuryDatabase;
  modelConfigs: ModelConfig[];
}) {
  const { db, modelConfigs } = args;
  // Fetch all of the prompts that we want to test
  const prompts = await db.promptsCollection.find({}).limit(5).toArray();
  // Determine which prompt-model pairs we want results for
  const promptModelPairsToTest = prompts.flatMap((prompt) => {
    return modelConfigs.map((model) => {
      return {
        promptId: prompt._id,
        model: model.label,
        developer: model.developer,
      };
    });
  });
  // Determine which prompt-model pairs we already have results for
  const existingResults = await db.resultsCollection
    .find({
      promptId: { $in: prompts.map((p) => p._id) },
    })
    .toArray();
  const existingPromptModelPairs = existingResults.map((r) => {
    return {
      promptId: r.promptId,
      model: r.model,
      developer: r.developer,
    };
  });
  // Diff the two sets to get the prompt-model pairs that we need to test
  const promptModelPairs = diffLists<
    { promptId: ObjectId; model: string; developer: string },
    { promptId: string; model: string; developer: string }
  >(promptModelPairsToTest, existingPromptModelPairs).map(
    ({ promptId, model, developer }) => {
      const prompt = prompts.find((p) => p._id.toString() === promptId);
      if (!prompt) {
        throw new Error(`Prompt ${promptId} not found`);
      }
      return {
        prompt,
        model,
        developer,
      };
    }
  );
  return promptModelPairs;
}
