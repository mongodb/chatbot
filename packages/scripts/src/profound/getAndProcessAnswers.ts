import path from "path";
import fs from "fs";
import os from "os";
import {
  ProfoundAnswer,
  ProfoundAnswerRequestBody,
  ProfoundApi,
} from "./profoundAPI";
import { makeReferenceAlignment } from "benchmarks";
import { getModel } from "../mercury/models";
import {
  createOutputs,
  mapReferenceAlignmentScoreToTag,
} from "../mercury/utils";
// ModelConfig imported but not used after switching to getModel; removing to keep style consistent
import { OpenAI } from "mongodb-rag-core/openai";
import { getEnv } from "mongodb-rag-core";
import { Query as MingoQuery } from "mingo";
import { PromisePool } from "@supercharge/promise-pool";
import {
  makeMercuryDatabase,
  MercuryAnswer,
  MercuryPrompt,
  MercuryReport,
} from "../mercury/database";
import { ObjectId } from "mongodb-rag-core/mongodb";
import {
  formatDate,
  getTodayIsoDate,
  getYesterdayIsoDate,
  validateDatestring,
} from "./utils";
import { ScoringFailedError } from "../mercury/errors";

const env = getEnv({
  required: [
    // BrainTrust
    "BRAINTRUST_PROXY_ENDPOINT",
    "BRAINTRUST_API_KEY",
    // Mercury
    "MERCURY_CONNECTION_URI",
    "MERCURY_DATABASE_NAME",
    "MERCURY_GENERATOR_MODEL_NAME",
    "MERCURY_JUDGEMENT_MODEL_NAME",
    "MERCURY_REPORTS_COLLECTION",
    "MERCURY_PROMPTS_COLLECTION",
    "MERCURY_ANSWERS_COLLECTION",
    "MERCURY_RESULTS_COLLECTION",
    // Profound
    "PROFOUND_API_KEY",
    "PROFOUND_CATALOG_ID_EDU",
  ],
  optional: {
    BATCH_SIZE: "50",
  },
});

const profoundAPI = new ProfoundApi({ apiKey: env.PROFOUND_API_KEY });

// Helper function to split an array into batches
function createBatches<T>(array: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  return batches;
}

export interface GetAnswersArgs {
  startDate: string;
  endDate: string;
  caseContent?: string;
  platformId?: string;
}

export async function getAnswers({
  startDate,
  endDate,
  caseContent,
  platformId,
}: GetAnswersArgs): Promise<ProfoundAnswer[]> {
  const filters: ProfoundAnswerRequestBody["filters"] = [];
  if (caseContent) {
    filters.push({
      operator: "matches",
      field: "prompt",
      value: caseContent,
    });
  }
  if (platformId) {
    filters.push({
      operator: "is",
      field: "model",
      value: platformId,
    });
  }
  const body: ProfoundAnswerRequestBody = {
    filters,
    start_date: startDate,
    end_date: endDate,
    include: {
      prompt_id: true,
      run_id: true,
    },
  };
  const response = await profoundAPI.getAnswers({
    body,
    categoryId: env.PROFOUND_CATALOG_ID_EDU,
  });
  return response.data;
}

function groupByProfoundPromptId(
  prompts: MercuryPrompt[]
): Record<string, MercuryPrompt> {
  return prompts.reduce((map, prompt) => {
    map[prompt.metadata.profoundPromptId] = prompt;
    return map;
  }, {} as Record<string, MercuryPrompt>);
}

async function makeMapProfoundPlatformNameToId(): Promise<
  (platformName: string) => string
> {
  const platforms = await profoundAPI.getModels();
  const map = new Map<string, string>(
    platforms.map((record) => [record.name, record.id])
  );
  return (platformName) => map.get(platformName) ?? "Unknown";
}

function makeMapAnswerToDataset(
  reports: MercuryReport[],
  prompts: MercuryPrompt[]
): (answer: ProfoundAnswer) => { name: string; slug: string } {
  const entries = reports.flatMap((report) => {
    if (report.slug === "all") {
      return [];
    }
    return new MingoQuery(report.query)
      .find<MercuryPrompt>(prompts)
      .all()
      .map(
        (prompt) =>
          [
            prompt.metadata.profoundPromptId,
            { name: report.name, slug: report.slug },
          ] satisfies [string, { name: string; slug: string }]
      ) as unknown as [string, { name: string; slug: string }][];
  });
  const map = new Map(entries);
  return (answer) => {
    return (
      map.get(answer.prompt_id) ?? {
        name: "Unknown",
        slug: "Unknown",
      }
    );
  };
}

const judgementModelConfig = getModel("gpt-4.1");

const BATCH_SIZE = parseInt(env.BATCH_SIZE);

function makeDedupeKey(args: {
  day: string;
  prompt: string;
  platformId: string | undefined;
}) {
  return JSON.stringify({
    day: args.day,
    platformId: args.platformId ?? "",
    prompt: args.prompt,
  });
}

export const main = async (
  args: { startDate?: string; endDate?: string; outputDir?: string } = {}
) => {
  const db = makeMercuryDatabase({
    connectionUri: env.MERCURY_CONNECTION_URI,
    databaseName: env.MERCURY_DATABASE_NAME,
    promptsCollectionName: env.MERCURY_PROMPTS_COLLECTION,
    resultsCollectionName: env.MERCURY_RESULTS_COLLECTION,
    reportsCollectionName: env.MERCURY_REPORTS_COLLECTION,
    answersCollectionName: env.MERCURY_ANSWERS_COLLECTION,
  });

  // Determine date range from command line arguments, or default to yesterday --> today
  // Note: The Profound API expects date inputs in EST, bc they execute prompts within a 24 hour EST window.
  const start = validateDatestring(args.startDate ?? getYesterdayIsoDate());
  const end = validateDatestring(args.endDate ?? getTodayIsoDate());

  const answersCollection = db.answersCollection;

  const reports = await db.reportsCollection.find({}).toArray();
  const prompts = await db.promptsCollection.find({}).toArray();
  const profoundPromptIdToPromptMap = groupByProfoundPromptId(prompts);
  const mapProfoundPlatformNameToId = await makeMapProfoundPlatformNameToId();
  const mapAnswerToDataset = makeMapAnswerToDataset(reports, prompts);

  const answers = await getAnswers({
    startDate: start,
    endDate: end,
  });
  console.log(
    `Processing ${answers.length} answers generated between ${start} and ${end}`
  );

  // Precompute dedupe set from existing records: YYYY-MM-DD (NY) + prompt + platformId
  const promptsSet = new Set<string>(answers.map((a) => a.prompt));
  const platformIdsSet = new Set<string>(
    answers
      .map((answer) => mapProfoundPlatformNameToId(answer.model))
      .filter((pid) => typeof pid === "string")
  );
  try {
    await db.connect();
    const existingDocs = await db.answersCollection
      .find({
        platformId: { $in: Array.from(platformIdsSet) },
        prompt: { $in: Array.from(promptsSet) },
      })
      .toArray();

    console.log(
      `Debug: Prefetched ${existingDocs.length} existing documents from database`
    );

    const alreadyScored = new Set<string>(
      existingDocs.map((doc) =>
        makeDedupeKey({
          day: formatDate(new Date(doc.date)),
          prompt: doc.prompt,
          platformId: doc.platformId,
        })
      )
    );

    const answersToProcess = answers.filter((answer) => {
      const dedupeKey = makeDedupeKey({
        prompt: answer.prompt,
        platformId: mapProfoundPlatformNameToId(answer.model),
        day: formatDate(new Date(answer.created_at + "Z")), // TODO - Find out what timezone this is returned in because it's not UTC
      });
      return !alreadyScored.has(dedupeKey);
    });

    console.log(
      `Total answers for period: ${answers.length}\nAlready scored: ${alreadyScored.size}\nTo process: ${answersToProcess.length}`
    );

    if (answersToProcess.length === 0) {
      console.log("No answers need processing. Exiting.");
      return;
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

    // Process answers in batches
    const batches = createBatches(answersToProcess, BATCH_SIZE);
    console.log(
      `Processing ${answersToProcess.length} answers in ${batches.length} batches of size ${BATCH_SIZE}`
    );

    const allErrors: Error[] = [];
    const allSkipped: string[] = [];
    const allRecords: any[] = [];
    const promptsWithNoAssociatedCase = new Set<string>();

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(
        `\n--- Processing batch ${batchIndex + 1}/${batches.length} (${
          batch.length
        } answers) ---`
      );

      const batchErrors: Error[] = [];
      const batchSkipped: string[] = [];
      const { results: batchResults } = await PromisePool.for(batch)
        .withConcurrency(10)
        .handleError((error) => {
          batchErrors.push(error);
        })
        .process(async (currentAnswer) => {
          const skipRegex =
            /Evaluate the MongoDB - Docs \/ Education company MongoDB/;
          if (skipRegex.test(currentAnswer.prompt)) {
            batchSkipped.push(currentAnswer.prompt);
            return null;
          }
          // Find the corresponding llm_cases document (to get expected response & tags)
          const currentCase =
            profoundPromptIdToPromptMap[currentAnswer.prompt_id];
          if (!currentCase) {
            promptsWithNoAssociatedCase.add(
              `${currentAnswer.prompt_id} - ${currentAnswer.prompt}`
            );
            return null; // Skip processing this answer since we don't have the case data
          }
          const platformId = mapProfoundPlatformNameToId(currentAnswer.model);

          // calculate reference alignment score
          const scorerArgs = {
            input: {
              messages: [
                {
                  role: "user" as const,
                  content: currentAnswer.prompt,
                },
              ],
            },
            output: {
              response: currentAnswer.response,
              links: currentAnswer.citations,
            },
            expected: {
              reference: currentCase?.expected ?? "",
              links: [], // TODO: update with links from currentCase if defined
            },
            metadata: {},
          };
          try {
            const score = await scoreReferenceAlignment(scorerArgs);
            const answer = {
              _id: new ObjectId(),
              createdAt: new Date(),
              type: "answer-engine",
              caseId: currentCase._id,
              promptId: currentCase._id,
              platformName: currentAnswer.model,
              platformId,
              date: new Date(currentAnswer.created_at),
              prompt: currentAnswer.prompt,
              region: currentAnswer.region,
              response: currentAnswer.response,
              metrics: {
                referenceAlignment: {
                  score: score.score ?? -1,
                  label:
                    mapReferenceAlignmentScoreToTag(score.score) ?? undefined,
                  rationale:
                    (score.metadata?.rationale as string | undefined) ??
                    undefined,
                  judgementModel: judgementModelConfig.label,
                },
              },
              citations: Array.from(new Set(currentAnswer.citations)).map(
                (citation) => {
                  const url = new URL(citation);
                  return {
                    url: url.toString(),
                    hostname: url.hostname,
                    path: url.pathname,
                  };
                }
              ),
              tags: currentCase?.tags,
              expectedResponse: currentCase?.expected,
              profoundPromptId: currentAnswer.prompt_id,
              profoundRunId: currentAnswer.run_id,
              dataset: mapAnswerToDataset(currentAnswer),
              category: currentCase.metadata.category,
            } satisfies MercuryAnswer;
            return answer;
          } catch (error) {
            console.error(error);
            throw new ScoringFailedError({
              prompt: currentCase,
              model: currentAnswer.model,
              scorer: scorerArgs,
              error: error instanceof Error ? error : new Error(String(error)),
            });
          }
        });

      // Upload batch results to MongoDB immediately
      const validResults = batchResults.filter(
        (record): record is NonNullable<typeof record> => record !== null
      );
      if (validResults.length > 0) {
        console.log(
          `Saving ${validResults.length} processed results from batch ${
            batchIndex + 1
          } to MongoDB`
        );
        try {
          const result = await db.answersCollection.insertMany(validResults);
          console.log(
            `Batch ${batchIndex + 1} save completed: ${
              result.insertedCount
            } inserted`
          );
        } catch (err) {
          console.error(`Batch ${batchIndex + 1} save failed:`, err);
        }
      }

      // Add to cumulative totals
      allErrors.push(...batchErrors);
      allSkipped.push(...batchSkipped);
      allRecords.push(...validResults);

      // Log batch completion
      console.log(`Batch ${batchIndex + 1} completed:`);
      console.log(`  - Successfully processed: ${validResults.length} answers`);
      console.log(`  - Failed: ${batchErrors.length} answers`);
      console.log(`  - Skipped: ${batch.length - validResults.length} answers`);
      console.log(
        `  - Cumulative total: ${allRecords.length} successful, ${allErrors.length} failed`
      );
    }

    // Final summary
    console.log(`\n=== Final Summary ===`);
    console.log(`Successfully processed ${allRecords.length} answers`);
    console.log(`Failed to process ${allErrors.length} answers`);
    console.log(`Skipped ${allSkipped.length} answers`);
    console.log(
      `Found ${promptsWithNoAssociatedCase.size} prompts with no associated case:`
    );

    if (allErrors.length > 0) {
      console.error("Errors during processing:", allErrors.slice(0, 5)); // Show first 5 errors
    }

    if (args.outputDir) {
      const { errorsFile, resultsFile, skippedFile } = createOutputs({
        outputDir: args.outputDir,
        errors: allErrors,
        results: allRecords,
        skipped: allSkipped,
      });
      console.log("Skipped written to", skippedFile);
      console.log("Errors written to", errorsFile);
      console.log("Results written to", resultsFile);
    }
  } finally {
    await db.disconnect();
  }
};

// Usage documentation for CLI users
if (process.argv.includes("--help")) {
  console.log(`
Usage: node getAndProcessAnswers.js [startDate] [endDate]

Optional arguments:
  startDate   YYYY-MM-DD date string (e.g., 2025-06-01). If omitted, defaults to yesterday (EST).
  endDate     YYYY-MM-DD date string (e.g., 2025-06-02). If omitted, defaults to today (EST).

The end date is exclusive. 
For example, if you want to process answers from June 1st to June 5th, you should use 2025-06-01 and 2025-06-06.
If you want to process one day, like June 1st, you should use 2025-06-01 and 2025-06-02.

Examples:
  node getAndProcessAnswers.js
  node getAndProcessAnswers.js 2025-06-01
  node getAndProcessAnswers.js 2025-06-01 2025-06-06
`);
  process.exit(0);
}

main({
  startDate: process.argv[2],
  endDate: process.argv[3],
  outputDir: path.join(os.homedir(), `/Desktop/mercury-results/answers`),
});
