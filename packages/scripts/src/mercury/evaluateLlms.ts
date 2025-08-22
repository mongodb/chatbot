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
import { getModel, getModels } from "./models";
import { diffLists } from "./utils";
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
  },
});

export const testModelConfigs = getModels([
  // OpenAI
  "gpt-5",
  "gpt-5-mini",
  "gpt-5-nano",
  "gpt-4o",
  "gpt-4o-mini",
  "o3-mini",
  "o3",
  "o4-mini",
  "gpt-4.1",
  "gpt-4.1-mini",
  "gpt-4.1-nano",
  // Anthropic
  // "claude-35-haiku",
  // "claude-35-sonnet",
  // "claude-35-sonnet-v2",
  // "claude-37-sonnet",
  // Meta
  // "llama-3.1-70b",
  // "llama-3.2-90b",
  // "llama-3.3-70b",
  // Google
  // "gemini-2-flash",
  // "gemini-2.0-flash-lite-001",
  // "gemini-2.5-flash",
  // "gemini-2.5-pro",
  // Amazon
  // "nova-micro-v1:0",
  // "nova-lite-v1:0",
  // "nova-pro-v1:0",
  // Mistral
  // "mistral-large-2",
]);

const judgementModelConfig = getModel("gpt-4.1");

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
    const prompts = await db.promptsCollection.find({}).limit(3).toArray();
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
        };
      }
    );
    // Test the prompt-model pairs
    const errors: Error[] = [];
    const { results } = await PromisePool.for(promptModelPairs)
      .withConcurrency(10)
      .handleError((error) => {
        errors.push(error);
      })
      .process(async ({ prompt, model, developer }) => {
        console.log("Processing prompt", prompt._id, "with model", model);
        let generatedResponse: Awaited<ReturnType<typeof generateText>>;
        try {
          generatedResponse = await generateText({
            model: createOpenAI({
              baseURL: env.BRAINTRUST_PROXY_ENDPOINT,
              apiKey: env.BRAINTRUST_API_KEY,
            }).chat(model),
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
    console.log(`Successfully scored ${results.length} prompts`);

    const numGenerationErrors = errors.filter(
      (e) => e instanceof GenerationFailedError
    ).length;
    const numScoringErrors = errors.filter(
      (e) => e instanceof ScoringFailedError
    ).length;
    console.log(
      `Failed to score ${errors.length} prompts\n  - ${numGenerationErrors} generation errors\n  - ${numScoringErrors} scoring errors`
    );
    console.log("errors", errors);
    const { errorsFile, resultsFile } = createOutputs({
      outputDir: args.outputDir,
      errors,
      results,
    });
    console.log("Errors written to", errorsFile);
    console.log("Results written to", resultsFile);

    console.log("Uploading results to Mercury", results.length);
    await db.resultsCollection.insertMany(results);
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
      };
    }
  );
  return promptModelPairs;
}
