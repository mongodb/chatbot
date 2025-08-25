import {
  ProfoundAnswer,
  ProfoundAnswerRequestBody,
  ProfoundApi,
} from "./profoundAPI";
import { makeReferenceAlignment } from "benchmarks";
import { getModel } from "../mercury/models";
import { mapReferenceAlignmentScoreToTag } from "../mercury/evaluateLlms";
// ModelConfig imported but not used after switching to getModel; removing to keep style consistent
import { OpenAI } from "mongodb-rag-core/openai";
import { getEnv } from "mongodb-rag-core";
import { Collection, MongoClient, ObjectId } from "mongodb-rag-core/mongodb";
import { PromisePool } from "@supercharge/promise-pool";

const env = getEnv({
  required: [
    "BRAINTRUST_PROXY_ENDPOINT",
    "BRAINTRUST_API_KEY",
    "MERCURY_CONNECTION_URI",
    "MERCURY_DATABASE_NAME",
    "MERCURY_GENERATOR_MODEL_NAME",
    "MERCURY_JUDGEMENT_MODEL_NAME",
    "MERCURY_REPORTS_COLLECTION",
    "MERCURY_PROMPTS_COLLECTION",
    "MERCURY_ANSWERS_COLLECTION",
    "MERCURY_RESULTS_COLLECTION",
  ],
  optional: {
    BATCH_SIZE: "50",
  },
});

const profoundAPI = new ProfoundApi();

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
  platform?: string;
}

export async function getAnswers({
  startDate,
  endDate,
  caseContent,
  platform,
}: GetAnswersArgs): Promise<ProfoundAnswer[]> {
  const filters: ProfoundAnswerRequestBody["filters"] = [];
  if (caseContent) {
    filters.push({
      operator: "matches",
      field: "prompt",
      value: caseContent,
    });
  }
  if (platform) {
    filters.push({
      operator: "is",
      field: "model",
      value: platform,
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
  console.log("Getting answers from Profound API for these params:", { body });
  const response = await profoundAPI.getAnswers({ body });
  console.log(`Got ${response.data.length} answers from Profound API`);
  return response.data;
}

interface CaseByProfoundPromptId {
  [key: string]: {
    expected: string;
    tags: string[];
    caseId: ObjectId;
    metadata: {
      category: string;
    };
  };
}
const casesByPromptId = async (
  collection: Collection
): Promise<CaseByProfoundPromptId> => {
  const documents = await collection.find().toArray();
  return documents.reduce((map, doc) => {
    map[doc.profoundPromptId] = {
      expected: doc.expected,
      tags: doc.tags,
      caseId: doc._id,
      metadata: doc.metadata,
    };
    return map;
  }, {} as CaseByProfoundPromptId);
};

const platformsByName = async (): Promise<Record<string, string>> => {
  const platforms = await profoundAPI.getModels();
  return Object.fromEntries(
    platforms.map((record) => [record.name, record.id])
  );
};

interface DatasetByTag {
  [key: string]: {
    name: string;
    slug: string;
  };
}
const datasetsByTag = async (collection: Collection): Promise<DatasetByTag> => {
  const documents = await collection.find().toArray();
  return documents.reduce((map, doc) => {
    map[doc.query.tags] = {
      name: doc.name,
      slug: doc.slug,
    };
    return map;
  }, {} as DatasetByTag);
};

const getDataset = (
  tags: string[],
  datasetsByTagMap: DatasetByTag
): { name: string; slug: string } | null => {
  for (const tag of tags) {
    if (datasetsByTagMap[tag]) {
      return datasetsByTagMap[tag];
    }
  }
  console.error("No matching dataset found for tags:", tags);
  return null;
};

const judgementModelConfig = getModel("gpt-4.1");

const BATCH_SIZE = parseInt(env.BATCH_SIZE);

function formatDateInTimeZone(date: Date, timeZone: string) {
  // Returns YYYY-MM-DD in the specified time zone
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, part) => {
      if (part.type !== "literal") acc[part.type] = part.value;
      return acc;
    }, {});
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function enumerateDateStrings(
  startYYYYMMDD: string,
  endYYYYMMDDExclusive: string
) {
  // Generates all YYYY-MM-DD strings (America/New_York) from start (inclusive) to end (exclusive)
  const results: string[] = [];
  const tz = "America/New_York";
  let cursor = new Date(`${startYYYYMMDD}T00:00:00Z`);
  // Adjust cursor to NY midnight by reading back the formatted date each loop
  while (true) {
    const current = formatDateInTimeZone(cursor, tz);
    results.push(current);
    if (current === endYYYYMMDDExclusive) break; // safety; should not match normally
    // advance by 1 day
    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
    const next = formatDateInTimeZone(cursor, tz);
    if (next === endYYYYMMDDExclusive) break;
    if (results[results.length - 1] === next) continue; // handle DST shifts
  }
  // ensure we include at least the start day
  return Array.from(new Set(results));
}

function makeDedupeKey(args: {
  day: string;
  prompt: string;
  platformId: string | undefined;
}) {
  return `${args.day}|${args.prompt}|${args.platformId ?? ""}`;
}

export const main = async (startDateArg?: string, endDateArg?: string) => {
  // START setup

  // validate date format in args
  if (startDateArg && !/^\d{4}-\d{2}-\d{2}$/.test(startDateArg)) {
    throw new Error("Invalid start date format. Please use YYYY-MM-DD.");
  }
  if (endDateArg && !/^\d{4}-\d{2}-\d{2}$/.test(endDateArg)) {
    throw new Error("Invalid end date format. Please use YYYY-MM-DD.");
  }
  // Determine date range from command line arguments, or default to yesterday --> today
  // Note: The Profound API expects date inputs in EST, bc they execute prompts within a 24 hour EST window.
  const today: Date = new Date();
  const yesterday: Date = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const start: string = startDateArg
    ? startDateArg
    : new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(yesterday);
  const end: string = endDateArg
    ? endDateArg
    : new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(today);

  const client = await MongoClient.connect(env.MERCURY_CONNECTION_URI);
  const db = client.db(env.MERCURY_DATABASE_NAME);
  const answersCollection = db.collection(env.MERCURY_ANSWERS_COLLECTION);
  const casesCollection = db.collection(env.MERCURY_PROMPTS_COLLECTION);
  const reportsCollection = db.collection(env.MERCURY_REPORTS_COLLECTION);
  // create a hashmap of all cases, where the key is the profound prompt id so that we can find the case that corresponds to the answer
  const casesByPromptMap = await casesByPromptId(casesCollection);
  // create a hashmap of all platforms, where the key is the platform name and the value is the platform id
  const platformsByNameMap = await platformsByName();
  // create a hashmap of all dataset tags, where the key is the tag and the value is the dataset name and slug
  const datasetsByTagMap = await datasetsByTag(reportsCollection);
  // END set up

  const answers = await getAnswers({
    startDate: start,
    endDate: end,
  });
  console.log(
    `Processing ${answers.length} answers generated between ${start} and ${end}`
  );

  // Precompute dedupe set from existing records: YYYY-MM-DD (NY) + prompt + platformId
  const nyTz = "America/New_York";
  const targetDays = new Set<string>(enumerateDateStrings(start, end));
  const promptsSet = new Set<string>(answers.map((a) => a.prompt));
  const platformIdsSet = new Set<string>();
  for (const a of answers) {
    const pid = platformsByNameMap[a.model];
    if (pid) platformIdsSet.add(pid);
  }
  let existingDocs: Array<{
    date?: Date;
    prompt?: string;
    platformId?: string;
    metrics?: { referenceAlignment?: { score?: number | null } };
  }> = [];
  try {
    existingDocs = await answersCollection
      .find({
        platformId: { $in: Array.from(platformIdsSet) },
        prompt: { $in: Array.from(promptsSet) },
      })
      .project({
        date: 1,
        prompt: 1,
        platformId: 1,
        "metrics.referenceAlignment.score": 1,
      })
      .toArray();
  } catch (err) {
    console.warn(
      "Warning: failed to prefetch existing answers for dedupe; proceeding without prefilter.",
      err
    );
  }

  console.log(
    `Debug: Prefetched ${existingDocs.length} existing documents from database`
  );

  const scoredDedupeKeys = new Set<string>();
  let scoredDocsCount = 0;
  for (const doc of existingDocs) {
    if (!doc.date || !doc.prompt || !doc.platformId) continue;
    const scored = doc.metrics?.referenceAlignment?.score != null;
    if (!scored) continue;
    scoredDocsCount++;
    const day = formatDateInTimeZone(new Date(doc.date), nyTz);
    if (!targetDays.has(day)) continue;
    scoredDedupeKeys.add(
      makeDedupeKey({ day, prompt: doc.prompt, platformId: doc.platformId })
    );
  }

  console.log(
    `Debug: Found ${scoredDocsCount} scored documents, ${scoredDedupeKeys.size} within target date range`
  );

  // Filter out answers that are already processed before batching
  let topicsFilteredCount = 0;
  const answersToProcess = answers.filter((answer) => {
    // Skip answers that profound creates to evaluate Topics
    const regex = /Evaluate the MongoDB - Docs \/ Education company MongoDB on/;
    if (regex.test(answer.prompt)) {
      topicsFilteredCount++;
      return false;
    }

    // Check if already processed using dedupe logic
    const platformId = platformsByNameMap[answer.model];
    const dayKey = formatDateInTimeZone(
      new Date(answer.created_at + "Z"),
      nyTz
    );
    const dedupeKey = makeDedupeKey({
      day: dayKey,
      prompt: answer.prompt,
      platformId,
    });
    return !scoredDedupeKeys.has(dedupeKey);
  });

  console.log(
    `Debug: Filtered out ${topicsFilteredCount} Topics evaluation prompts`
  );

  // Debug: show some sample dedupe keys we're looking for vs. what we found
  if (answersToProcess.length > 0 && scoredDedupeKeys.size > 0) {
    const sampleAnswer = answersToProcess[0];
    const samplePlatformId = platformsByNameMap[sampleAnswer.model];
    const sampleDayKey = formatDateInTimeZone(
      new Date(sampleAnswer.created_at + "Z"),
      nyTz
    );
    const sampleDedupeKey = makeDedupeKey({
      day: sampleDayKey,
      prompt: sampleAnswer.prompt,
      platformId: samplePlatformId,
    });
    console.log(
      `Debug: Sample dedupe key from new answer: "${sampleDedupeKey}"`
    );
    console.log(
      `Debug: First few existing dedupe keys: ${Array.from(scoredDedupeKeys)
        .slice(0, 3)
        .join(", ")}`
    );
  }

  console.log(
    `Found ${answersToProcess.length} answers to process out of ${
      answers.length
    } total answers (${
      answers.length - answersToProcess.length
    } already processed)`
  );

  if (answersToProcess.length === 0) {
    console.log("No answers need processing. Exiting.");
    await client.close();
    return;
  }

  // get reference alignment scores for answers
  const openAiClient = new OpenAI({
    baseURL: env.BRAINTRUST_PROXY_ENDPOINT,
    apiKey: env.BRAINTRUST_API_KEY,
  });
  const referenceAlignmentFn = makeReferenceAlignment(
    openAiClient,
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
  const allRecords: any[] = [];
  const promptsWithNoAssociatedCase = new Set();

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
        const currentPrompt = currentAnswer.prompt;
        const currentPromptId = currentAnswer.prompt_id;
        const currentCase = casesByPromptMap[currentPromptId];
        if (!currentCase) {
          promptsWithNoAssociatedCase.add(
            `${currentPromptId} - ${currentPrompt}`
          );
        }

        // Get platformId for record creation
        const platformId = platformsByNameMap[currentAnswer.model];

        // calculate reference alignment score
        let referenceAlignment;
        try {
          referenceAlignment = (await referenceAlignmentFn({
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
          })) as {
            score: number | null;
            name: string;
            metadata: {
              rationale: string;
              choice: string;
            };
          };
        } catch (err) {
          console.error("Error in referenceAlignmentFn:", {
            prompt: currentAnswer.prompt,
            profoundPromptId: currentAnswer.prompt_id,
            profoundRunId: currentAnswer.run_id,
            error: err,
          });
          referenceAlignment = {
            score: null,
            name: "ReferenceAlignment",
            metadata: {
              rationale: "Error during evaluation",
              choice: "",
            },
          };
        }

        // create the llm_answers record
        const answerEngineRecord = {
          type: "answer-engine",
          caseId: currentCase?.caseId ?? null,
          platformName: currentAnswer.model,
          platformId,
          date: new Date(currentAnswer.created_at + "Z"),
          prompt: currentAnswer.prompt,
          region: currentAnswer.region,
          response: currentAnswer.response,
          metrics: {
            referenceAlignment: {
              score: referenceAlignment.score,
              label:
                mapReferenceAlignmentScoreToTag(referenceAlignment.score) ??
                undefined,
              rationale: referenceAlignment.metadata?.rationale,
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
          dataset: currentCase
            ? getDataset(currentCase.tags, datasetsByTagMap)
            : null,
          category: currentCase ? currentCase.metadata.category : null,
        };
        return answerEngineRecord;
      });

    // Upload batch results to MongoDB immediately
    const validResults = batchResults.filter(
      (record): record is NonNullable<typeof record> => record != null
    );
    if (validResults.length > 0) {
      console.log(
        `Saving ${validResults.length} processed results from batch ${
          batchIndex + 1
        } to MongoDB`
      );
      const bulkOps = validResults.map((record) => ({
        updateOne: {
          filter: { profoundRunId: record.profoundRunId },
          update: {
            $set: record,
            $setOnInsert: { createdAt: new Date() },
          },
          upsert: true,
        },
      }));
      try {
        const result = await answersCollection.bulkWrite(bulkOps);
        const inserted = result.upsertedCount || 0;
        const updated = result.modifiedCount || 0;
        const unchanged = validResults.length - inserted - updated;
        console.log(
          `Batch ${
            batchIndex + 1
          } save completed: ${inserted} inserted, ${updated} updated${
            unchanged > 0 ? `, ${unchanged} unchanged` : ""
          }`
        );
      } catch (err) {
        console.error(`Batch ${batchIndex + 1} save failed:`, err);
      }
    }

    // Add to cumulative totals
    allErrors.push(...batchErrors);
    allRecords.push(...validResults);

    // Log batch completion
    console.log(`Batch ${batchIndex + 1} completed:`);
    console.log(`  - Successfully processed: ${validResults.length} answers`);
    console.log(`  - Failed: ${batchErrors.length} answers`);
    console.log(
      `  - Cumulative total: ${allRecords.length} successful, ${allErrors.length} failed`
    );
  }

  // Final summary
  console.log(`\n=== Final Summary ===`);
  console.log(`Successfully processed ${allRecords.length} answers`);
  console.log(`Failed to process ${allErrors.length} answers`);
  console.log(
    `Found ${promptsWithNoAssociatedCase.size} prompts with no associated case:`
  );
  promptsWithNoAssociatedCase.forEach((promptInfo: any) => {
    console.log(` - ${promptInfo}`);
  });

  if (allErrors.length > 0) {
    console.error("Errors during processing:", allErrors.slice(0, 5)); // Show first 5 errors
  }
  await client.close();
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

const [, , startDateArg, endDateArg] = process.argv;
main(startDateArg, endDateArg);
