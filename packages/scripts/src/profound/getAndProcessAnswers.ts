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
  createBatches,
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
import { MongoBulkWriteError, ObjectId } from "mongodb-rag-core/mongodb";
import {
  countNumFailed,
  formatDate,
  getNHoursAfterIsoDate,
  getTodayIsoDate,
  getYesterdayIsoDate,
  makeDedupeKey,
  validateDatestring,
} from "./utils";
import { MongoWriteError, ScoringFailedError } from "../mercury/errors";
import util from "util";

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
    MAX_BATCHES: "",
  },
});

const profoundAPI = new ProfoundApi({ apiKey: env.PROFOUND_API_KEY });

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
  console.log(
    `Getting answers from Profound API for period ${startDate} to ${endDate}`
  );
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
  console.log(`Retrieved ${response.data.length} answers from Profound API`);
  const [earliestDate, latestDate] = response.data.reduce(
    ([earliest, latest], answer) => {
      const date = new Date(answer.created_at + "Z");
      return [date < earliest ? date : earliest, date > latest ? date : latest];
    },
    [
      new Date(response.data[0].created_at + "Z"),
      new Date(response.data[0].created_at + "Z"),
    ]
  );
  console.log(`Earliest date: ${earliestDate.toISOString()}`);
  console.log(`Latest date: ${latestDate.toISOString()}`);
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
const MAX_BATCHES = parseInt(env.MAX_BATCHES) || undefined;

console.log(`Batch size: ${BATCH_SIZE}`);
console.log(`Max batches: ${MAX_BATCHES}`);

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

  // const promptsSet = new Set<string>(answers.map((a) => a.prompt));
  const platformIdsSet = new Set<string>(
    answers
      .map((answer) => mapProfoundPlatformNameToId(answer.model))
      .filter((pid) => typeof pid === "string")
  );
  const profoundPromptIdsSet = new Set<string>(answers.map((a) => a.prompt_id));
  const reportDatesSet = new Set<string>(
    answers.map((a) => formatDate(new Date(a.created_at + "Z")))
  );
  try {
    await db.connect();
    const query = {
      platformId: { $in: Array.from(platformIdsSet) },
      profoundPromptId: { $in: Array.from(profoundPromptIdsSet) },
      reportDate: { $in: Array.from(reportDatesSet) },
      // platformId: { $in: Array.from(platformIdsSet) },
      // prompt: { $in: Array.from(promptsSet) },
      // // date: { $gte: new Date(start + "Z"), $lt: new Date(end + "Z") }, // TODO - I think there may be a timezone issue here
      // date: {
      //   $gte: new Date(getNHoursAfterIsoDate(new Date(start + "Z"), 4)),
      //   $lt: new Date(getNHoursAfterIsoDate(new Date(end + "Z"), 4)),
      // },
    };
    // console.log("query", util.inspect(query, { depth: null }));
    const existingDocs = await db.answersCollection.find(query).toArray();

    const alreadyScored = new Set<string>(
      existingDocs.map((doc) => {
        return makeDedupeKey({
          reportDate: doc.reportDate,
          profoundPromptId: doc.profoundPromptId,
          platformId: doc.platformId,
        });
      })
    );

    const allSkipped: string[] = [];
    const skipPatterns = [
      /Evaluate the MongoDB - Docs \/ Education company MongoDB/,
    ];

    const seenThisRun = new Set<string>();
    const counters = {
      eliminatedExisting: 0,
      skippedRegex: 0,
      duplicateInRun: 0,
    };
    const answersToProcess = answers.filter((answer) => {
      const dedupeKey = makeDedupeKey({
        reportDate: formatDate(new Date(answer.created_at + "Z")),
        profoundPromptId: answer.prompt_id,
        platformId: mapProfoundPlatformNameToId(answer.model),
      });
      const skipAlreadyScored = alreadyScored.has(dedupeKey);
      if (skipAlreadyScored) {
        counters.eliminatedExisting++;
        return false;
      }

      const skipRegex = skipPatterns.some((pattern) =>
        pattern.test(answer.prompt)
      );
      if (skipRegex) {
        counters.skippedRegex++;
        allSkipped.push(answer.prompt);
        return false;
      }

      const skipDuplicateInRun = seenThisRun.has(dedupeKey);
      if (skipDuplicateInRun) {
        counters.duplicateInRun++;
        allSkipped.push(answer.prompt);
        return false;
      }

      seenThisRun.add(dedupeKey);
      return true;
    });

    const reconciled =
      answers.length -
      counters.eliminatedExisting -
      counters.duplicateInRun -
      counters.skippedRegex -
      answersToProcess.length;
    console.log(
      `Total answers for period: ${answers.length}\n` +
        `Already scored answers (in DB): ${counters.eliminatedExisting}\n` +
        `Duplicates within this run: ${counters.duplicateInRun}\n` +
        `Skipped by regex: ${counters.skippedRegex}\n` +
        `Unique new keys to process: ${seenThisRun.size}\n` +
        `To process (records): ${answersToProcess.length}`
    );

    // Debug count
    if (reconciled !== 0) {
      console.log(
        `Warning: totals do not reconcile by ${reconciled}. ` +
          `Check filtering logic or counters.`
      );
    }

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
    const batches = createBatches({
      array: answersToProcess,
      batchSize: BATCH_SIZE,
      maxBatches: MAX_BATCHES,
    });
    console.log(
      `Processing ${answersToProcess.length} answers in ${batches.length} batches of size ${BATCH_SIZE}`
    );

    const allErrors: Error[] = [];
    const allSuccesses: any[] = [];
    const promptsWithNoAssociatedCase = new Set<string>();

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(
        `\n--- Processing batch ${batchIndex + 1}/${batches.length} (${
          batch.length
        } answers) ---`
      );

      const batchErrors: Error[] = [];
      const { results: batchResults } = await PromisePool.for(batch)
        .withConcurrency(10)
        .handleError((error) => {
          batchErrors.push(error);
        })
        .process(async (currentAnswer) => {
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
            metadata: {
              reportDate: formatDate(new Date(currentAnswer.created_at + "Z")),
              platformName: currentAnswer.model,
              profoundPromptId: currentAnswer.prompt_id,
            },
          };
          try {
            const score = await scoreReferenceAlignment(scorerArgs);
            const date = new Date(currentAnswer.created_at + "Z");
            const answer = {
              _id: new ObjectId(),
              createdAt: new Date(),
              type: "answer-engine",
              caseId: currentCase._id,
              promptId: currentCase._id,
              platformName: currentAnswer.model,
              platformId,
              date,
              reportDate: formatDate(date),
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
            console.error(
              `‼️ Scoring failed for profoundRunId: ${currentAnswer.run_id}`
            );
            throw new ScoringFailedError({
              prompt: currentCase,
              model: currentAnswer.model,
              scorer: scorerArgs,
              error,
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
          // const result = await db.answersCollection.insertMany(validResults);
          const result = await db.answersCollection.bulkWrite(
            validResults.map((a) => {
              return {
                insertOne: {
                  document: a,
                },
              };
            }),
            { ordered: false }
          );
          console.log(
            `Batch ${batchIndex + 1} save completed: ${
              result.insertedCount
            } inserted`
          );
        } catch (error) {
          if (!(error instanceof MongoBulkWriteError)) {
            batchErrors.push(
              error instanceof Error ? error : new Error(String(error))
            );
            continue;
          }
          const numErrors = error.result.getWriteErrorCount();
          const numSuccesses = error.result.insertedCount;
          console.error(
            `‼️ Batch ${
              batchIndex + 1
            } save failed: ${numErrors} errors, ${numSuccesses} inserted`
          );
          batchErrors.push(
            new MongoWriteError({
              error,
              ns: {
                db: db.answersCollection.dbName,
                collection: db.answersCollection.collectionName,
              },
              metadata: {
                batchIndex,
                numDocs: numErrors,
              },
            })
          );
          if (numSuccesses === 0) {
            validResults.length = 0;
          } else {
            const insertedIdValues = Object.values(
              error.result.insertedIds
            ).map((v) => v.toHexString());
            const newValidResults = validResults.filter((a) =>
              insertedIdValues.includes(a._id.toHexString())
            );
            validResults.length = 0;
            validResults.push(...newValidResults);
          }
        }
      }

      // Add to cumulative totals
      allErrors.push(...batchErrors);
      allSuccesses.push(...validResults);
      // Log batch completion
      console.log(`Batch ${batchIndex + 1} completed:`);
      console.log(`  - Successfully processed: ${validResults.length} answers`);
      console.log(
        `  - Failed to process: ${countNumFailed(batchErrors)} answers`
      );
      console.log(
        `  - Cumulative total: ${
          allSuccesses.length
        } successful, ${countNumFailed(allErrors)} failed`
      );
    }

    // Final summary
    console.log(`\n=== Final Summary ===`);
    console.log(`Successfully processed ${allSuccesses.length} answers`);
    console.log(`Failed to process ${countNumFailed(allErrors)} answers`);
    console.log(`Skipped ${allSkipped.length} answers`);
    if (promptsWithNoAssociatedCase.size > 0) {
      console.log(
        `Found ${promptsWithNoAssociatedCase.size} prompts with no associated case:`
      );
      promptsWithNoAssociatedCase.forEach((prompt) => {
        console.log(`  - ${prompt}`);
      });
    }

    if (args.outputDir) {
      const { errorsFile, resultsFile, skippedFile } = createOutputs({
        outputDir: args.outputDir,
        errors: allErrors,
        results: allSuccesses,
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
