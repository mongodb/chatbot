import {
  ProfoundAnswer,
  ProfoundAnswerRequestBody,
  ProfoundApi,
} from "./profoundAPI";
import { makeReferenceAlignment } from "benchmarks";
import {
  ModelConfig,
  getOpenAiEndpointAndApiKey,
} from "mongodb-rag-core/models";
import { OpenAI } from "mongodb-rag-core/openai";
import { getEnv } from "mongodb-rag-core";
import { Collection, MongoClient, ObjectId } from "mongodb-rag-core/mongodb";
import { PromisePool } from "@supercharge/promise-pool";

const {
  MERCURY_CONNECTION_URI,
  MERCURY_DATABASE_NAME,
  MERCURY_ANSWERS_COLLECTION,
  MERCURY_PROMPTS_COLLECTION,
  MERCURY_REPORTS_COLLECTION,
} = getEnv({
  required: [
    "MERCURY_CONNECTION_URI",
    "MERCURY_DATABASE_NAME",
    "MERCURY_ANSWERS_COLLECTION",
    "MERCURY_PROMPTS_COLLECTION",
    "MERCURY_REPORTS_COLLECTION",
  ],
});

const profoundAPI = new ProfoundApi();

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
  console.log("Getting answers from Profound API");
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
  console.log("Found cases", documents.length);
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
  // const platforms = await profoundAPI.getModels();
  // return Object.fromEntries(
  //   platforms.map((record) => [record.name, record.id])
  // );
  return {
    "Google AI Mode": "eea7fa6a-481d-4d95-86a7-d084718a7865",
    "Google AI Overviews": "dab8d6de-e787-46dd-9e40-9ac0a40c801a",
    "Meta AI": "6563cc8d-4955-4bba-9c6a-980028915f99",
    "Google Gemini": "ab90373a-d015-4feb-a7ee-fd9536a0ec53",
    Perplexity: "6c262973-268e-4611-8969-06c0520139c0",
    Grok: "cefa8cfd-bb28-4d47-9261-a4f0e9c1e75c",
    ChatGPT: "8e582977-dcf2-428f-9a1c-085c578ceeb8",
    "Microsoft Copilot": "94dcfb7c-4f9c-4f9c-9e55-c170c23d5d8a",
  };
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

const model: ModelConfig = {
  label: "gpt-4.1",
  deployment: "gpt-4.1",
  developer: "OpenAI",
  provider: "braintrust",
  authorized: true,
  maxConcurrency: 20,
  parent: "gpt-4o",
  generation: "gpt-4.1",
};

export const main = async (startDateArg?: string, endDateArg?: string) => {
  // START setup
  console.log("Starting setup", {
    startDateArg,
    endDateArg,
  });

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

  console.log("start and end dates", { start, end });

  console.log("Connecting to MongoDB", {
    MERCURY_DATABASE_NAME,
    MERCURY_ANSWERS_COLLECTION,
    MERCURY_PROMPTS_COLLECTION,
    MERCURY_REPORTS_COLLECTION,
  });
  const client = await MongoClient.connect(MERCURY_CONNECTION_URI);
  const db = client.db(MERCURY_DATABASE_NAME);
  const answersCollection = db.collection(MERCURY_ANSWERS_COLLECTION);
  const casesCollection = db.collection(MERCURY_PROMPTS_COLLECTION);
  const reportsCollection = db.collection(MERCURY_REPORTS_COLLECTION);
  // create a hashmap of all cases, where the key is the profound prompt id so that we can find the case that corresponds to the answer
  const casesByPromptMap = await casesByPromptId(casesCollection);
  console.log(`Found ${Object.keys(casesByPromptMap).length} cases`);
  // create a hashmap of all platforms, where the key is the platform name and the value is the platform id
  const platformsByNameMap = await platformsByName();
  console.log(`Found ${Object.keys(platformsByNameMap).length} platforms`);
  // create a hashmap of all dataset tags, where the key is the tag and the value is the dataset name and slug
  const datasetsByTagMap = await datasetsByTag(reportsCollection);
  console.log(`Found ${Object.keys(datasetsByTagMap).length} datasets`);
  // END set up

  const answers = await getAnswers({
    startDate: start,
    endDate: end,
  });
  console.log(
    `Processing ${answers.length} answers generated between ${start} and ${end}`
  );

  // get reference alignment scores for answers
  const endpointAndKey = await getOpenAiEndpointAndApiKey(model);
  const openAiClient = new OpenAI(endpointAndKey);
  const config = {
    model: model.deployment,
    temperature: 0,
    label: model.label,
  };
  const referenceAlignmentFn = makeReferenceAlignment(openAiClient, config);
  const answerRecords: any[] = [];
  const promptsWithNoAssociatedCase = new Set();
  const { results, errors } = await PromisePool.for(answers)
    .withConcurrency(model.maxConcurrency ?? 5)
    .process(async (currentAnswer) => {
      // ignore prompts that profound creates to evaluate Topics.
      const regex =
        /Evaluate the MongoDB - Docs \/ Education company MongoDB on/;
      if (regex.test(currentAnswer.prompt)) {
        return;
      }

      // Find the corresponding llm_cases document (to get expected response & tags)
      const currentPrompt = currentAnswer.prompt;
      const currentPromptId = currentAnswer.prompt_id;
      const currentCase = casesByPromptMap[currentPromptId];
      if (!currentCase) {
        promptsWithNoAssociatedCase.add(
          `${currentPromptId} - ${currentPrompt}`
        );
      }

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
        platformId: platformsByNameMap[currentAnswer.model],
        date: new Date(currentAnswer.created_at + "Z"),
        prompt: currentAnswer.prompt,
        region: currentAnswer.region,
        response: currentAnswer.response,
        metrics: {
          referenceAlignment: {
            score: referenceAlignment.score,
            rationale: referenceAlignment.metadata?.rationale,
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
      answerRecords.push(answerEngineRecord);
      return answerEngineRecord;
    });

  console.log(
    `Found ${promptsWithNoAssociatedCase.size} prompts with no associated case:`
  );
  promptsWithNoAssociatedCase.forEach((promptInfo: any) => {
    console.log(` - ${promptInfo}`);
  });
  // update the llm_answers collection
  if (answerRecords.length > 0) {
    const bulkOps = answerRecords.map((record) => ({
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
      console.log(
        `BulkWrite to llm_answers collection completed: ${inserted} inserted, ${updated} updated (out of ${answerRecords.length} records between ${start} and ${end}).`
      );
    } catch (err) {
      console.error("BulkWrite to llm_answers collection failed:", err);
    }
  }
  if (errors && errors.length > 0) {
    console.error("Errors while getting reference alignment scores:", errors);
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
