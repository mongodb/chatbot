import path from "path";
import os from "os";
import { PromisePool } from "@supercharge/promise-pool";
import { getEnv } from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { GenerationFailedError, ScoringFailedError } from "./errors";
import { getModel, mercuryModelConfigs } from "./models";
import {
  createBatches,
  createOutputs,
  diffLists,
  truncateString,
} from "./utils";
import {
  makeMercuryDatabase,
  MercuryDatabase,
  MercuryResult,
} from "./database";
import { ModelConfig } from "mongodb-rag-core/models";
import {
  evaluatePromptModelPairs,
  createEvaluationConfig,
  EvaluationTask,
} from "./evaluationCore";
import { OpenAI } from "mongodb-rag-core/openai";
import { createOpenAI } from "mongodb-rag-core/aiSdk";
import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";

const env = getEnv({
  required: [
    "MERCURY_CONNECTION_URI",
    "BRAINTRUST_PROXY_ENDPOINT",
    "BRAINTRUST_API_KEY",
    "AWS_BEDROCK_ACCESS_KEY_ID",
    "AWS_BEDROCK_SECRET_ACCESS_KEY",
  ],
  optional: {
    MERCURY_DATABASE_NAME: "docs-chatbot-dev",
    MERCURY_PROMPTS_COLLECTION: "llm_cases",
    MERCURY_REPORTS_COLLECTION: "llm_reports",
    MERCURY_RESULTS_COLLECTION: "llm_results",
    MERCURY_ANSWERS_COLLECTION: "llm_answers",
    AWS_BEDROCK_REGION: "us-east-1",
    BATCH_SIZE: "50",
    MAX_BATCHES: "",
  },
});

async function main(args: { outputDir: string }) {
  const db = makeMercuryDatabase({
    connectionUri: env.MERCURY_CONNECTION_URI,
    databaseName: env.MERCURY_DATABASE_NAME,
    promptsCollectionName: env.MERCURY_PROMPTS_COLLECTION,
    reportsCollectionName: env.MERCURY_REPORTS_COLLECTION,
    resultsCollectionName: env.MERCURY_RESULTS_COLLECTION,
    answersCollectionName: env.MERCURY_ANSWERS_COLLECTION,
  });
  try {
    await db.connect();
    // Fetch all of the prompts that we want to test
    const prompts = await db.promptsCollection.find({}).toArray();
    // Determine which prompt-model pairs we want results for
    const promptModelPairsToTest = prompts.flatMap((prompt) => {
      return mercuryModelConfigs.map((model) => {
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
    const promptModelPairsData = diffLists<
      { promptId: ObjectId; model: string; developer: string },
      { promptId: string; model: string; developer: string }
    >(promptModelPairsToTest, existingPromptModelPairs);

    // Convert to evaluation tasks
    const evaluationTasks: EvaluationTask[] = promptModelPairsData.map(
      ({ promptId, model, developer }) => {
        const prompt = prompts.find((p) => p._id.toString() === promptId);
        if (!prompt) {
          throw new Error(`Prompt ${promptId} not found`);
        }
        const modelConfig = mercuryModelConfigs.find((m) => m.label === model);
        if (!modelConfig) {
          throw new Error(`Model config for ${model} not found`);
        }
        return {
          prompt,
          model: modelConfig,
        };
      }
    );
    // Create evaluation configuration

    const evaluationConfig = createEvaluationConfig({
      generatorClients: {
        braintrust: createOpenAI({
          baseURL: env.BRAINTRUST_PROXY_ENDPOINT,
          apiKey: env.BRAINTRUST_API_KEY,
        }),
        "aws-bedrock": createAmazonBedrock({
          region: env.AWS_BEDROCK_REGION,
          accessKeyId: env.AWS_BEDROCK_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_BEDROCK_SECRET_ACCESS_KEY,
        }),
      },
      judgementClient: new OpenAI({
        baseURL: env.BRAINTRUST_PROXY_ENDPOINT,
        apiKey: env.BRAINTRUST_API_KEY,
      }),
      judgementModel: getModel("gpt-4.1"),
    });

    // Process evaluation tasks in batches
    const batchSize = parseInt(env.BATCH_SIZE);
    const maxBatches = parseInt(env.MAX_BATCHES) || undefined;

    console.log(`Batch size: ${batchSize}`);
    console.log(`Max batches: ${maxBatches}`);

    const batches = createBatches({
      array: evaluationTasks,
      batchSize: batchSize,
      maxBatches: maxBatches,
    });

    console.log(
      `Processing ${evaluationTasks.length} prompt-model pairs in ${batches.length} batches of size ${batchSize}`
    );

    const allErrors: (GenerationFailedError | ScoringFailedError)[] = [];
    const allResults: MercuryResult[] = [];

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(
        `\n--- Processing batch ${batchIndex + 1}/${batches.length} (${
          batch.length
        } pairs) ---`
      );

      let completedInBatch = 0;
      const { results: batchResults, errors: batchErrors } =
        await evaluatePromptModelPairs(batch, evaluationConfig, {
          concurrency: 10,
          onProgress: (completed, total) => {
            const task = batch[completedInBatch];
            if (task) {
              const truncatedPrompt = truncateString(task.prompt.name, 40);
              console.log(
                `Processing: { "prompt": "${truncatedPrompt}", "model": "${task.model.label}", "deployment": "${task.model.deployment}" }`
              );
              completedInBatch++;
            }
          },
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
      skipped: [],
    });
    console.log("Errors written to", errorsFile);
    console.log("Results written to", resultsFile);
  } finally {
    await db.disconnect();
  }
}

main({
  outputDir: path.join(os.homedir(), `/Desktop/mercury-results/llms`),
});

export async function getPromptModelPairs(args: {
  db: MercuryDatabase;
  modelConfigs: ModelConfig[];
}): Promise<EvaluationTask[]> {
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
  const promptModelPairsData = diffLists<
    { promptId: ObjectId; model: string; developer: string },
    { promptId: string; model: string; developer: string }
  >(promptModelPairsToTest, existingPromptModelPairs);

  // Convert to evaluation tasks
  const evaluationTasks: EvaluationTask[] = promptModelPairsData.map(
    ({ promptId, model, developer }) => {
      const prompt = prompts.find((p) => p._id.toString() === promptId);
      if (!prompt) {
        throw new Error(`Prompt ${promptId} not found`);
      }
      const modelConfig = modelConfigs.find((m) => m.label === model);
      if (!modelConfig) {
        throw new Error(`Model config for ${model} not found`);
      }
      return {
        prompt,
        model: modelConfig,
      };
    }
  );
  return evaluationTasks;
}
