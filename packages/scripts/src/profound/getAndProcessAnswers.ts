import {
  ProfoundAnswer,
  ProfoundAnswerRequestBody,
  ProfoundApi,
} from './profoundAPI';
import { makeReferenceAlignment } from "benchmarks";
import {
  ModelConfig,
  getOpenAiEndpointAndApiKey,
} from "mongodb-rag-core/models";
import { OpenAI } from "mongodb-rag-core/openai";
import { assertEnvVars } from 'mongodb-rag-core';
import { MongoClient, ObjectId } from 'mongodb';
import { Collection } from 'mongodb';
import { PromisePool } from '@supercharge/promise-pool';

const {
  MONGODB_LLM_CLUSTER_URI,
  MONGODB_LLM_DATABASE,
  MONGODB_LLM_CASES_COLLECTION,
  MONGODB_LLM_ANSWERS_COLLECTION,
} = assertEnvVars({
    'MONGODB_LLM_CLUSTER_URI': "",
    'MONGODB_LLM_DATABASE': "",
    'MONGODB_LLM_CASES_COLLECTION': "",
    'MONGODB_LLM_ANSWERS_COLLECTION': "",
});

const profoundAPI = new ProfoundApi();

const getFullDayRange = (from: Date, to: Date) => {
  const start = new Date(from);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(to); 
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
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
  platform
}: GetAnswersArgs): Promise<ProfoundAnswer[]> {
  const filters: ProfoundAnswerRequestBody['filters'] = [];
  if (caseContent) {
    filters.push({
      operator: 'matches',
      field: 'prompt',
      value: caseContent
    });
  }
  if (platform) {
    filters.push({
      operator: 'is',
      field: 'model',
      value: platform
    });
  }
  const body: ProfoundAnswerRequestBody = {
    filters,
    start_date: startDate,
    end_date: endDate,
    include: {
      prompt_id: true,
      run_id: true
    }
  };
  console.log('Getting answers from Profound API for these params:', { body })
  const response = await profoundAPI.getAnswers({ body });
  return response.data;
}

interface CaseByProfoundPromptId {
  [key: string]: {
    "expected": string;
    "tags": string[];
    "caseId": ObjectId;
  }
}
const casesByPromptId = async (collection: Collection): Promise<CaseByProfoundPromptId> => {
  const documents = await collection.find().toArray();
  return documents.reduce((map, doc) => {
    map[doc.profoundPromptId] = {
      expected: doc.expected,
      tags: doc.tags,
      caseId: doc._id,
    };
    return map;
  }, {} as CaseByProfoundPromptId);
}

const platformsByName = async (): Promise<Record<string, string>> => {
  const platforms = await profoundAPI.getModels();
  return Object.fromEntries(platforms.map(record => [record.name, record.id]));
}

const model: ModelConfig = {
  label: "gpt-4.1",
  deployment: "gpt-4.1",
  developer: "OpenAI",
  provider: "braintrust",
  authorized: true,
  maxConcurrency: 20,
  parent: "gpt-4o",
  generation: "gpt-4.1",
}

export const main = async (startDateArg?: string, endDateArg?: string) => {
  // START setup
  // Parse optional startDate and endDate from command line arguments
  let start: Date, end: Date;
  if (startDateArg) {
    const startDate = new Date(startDateArg);
    const endDate = endDateArg ? new Date(endDateArg) : startDate;
    ({ start, end } = getFullDayRange(startDate, endDate));
  } else {
    // Default to yesterday
    const now = new Date();
    const utcYear = now.getUTCFullYear();
    const utcMonth = now.getUTCMonth();
    const utcDate = now.getUTCDate();
    const yesterday = new Date(Date.UTC(utcYear, utcMonth, utcDate - 1));
    ({ start, end } = getFullDayRange(yesterday, yesterday));
  }

  const client = await MongoClient.connect(MONGODB_LLM_CLUSTER_URI);
  const db = client.db(MONGODB_LLM_DATABASE);
  const answersCollection = db.collection(MONGODB_LLM_ANSWERS_COLLECTION);
  const casesCollection = db.collection(MONGODB_LLM_CASES_COLLECTION);
  // create a hashmap of all cases, where the key is the profound prompt id so that we can find the case that corresponds to the answer
  const casesByPromptMap = await casesByPromptId(casesCollection)
  const platformsByNameMap = await platformsByName()
  // END set up

  const answers = await getAnswers({
    startDate: start.toISOString(),
    endDate: end.toISOString()
  });
  console.log(`Processing ${answers.length} answers generated between ${start.toISOString()} and ${end.toISOString()}`)

  // get reference alignment scores for answers
  const endpointAndKey = await getOpenAiEndpointAndApiKey(model);
  const config =  {
    openAiClient: new OpenAI(endpointAndKey),
    model: model.deployment,
    temperature: 0,
    label: model.label,
  };
  const referenceAlignmentFn = makeReferenceAlignment(config);
  const answerRecords: any[] = [];
  const { results, errors } = await PromisePool
    .for(answers)
    .withConcurrency(model.maxConcurrency ?? 5)
    .process(async (currentAnswer) => {
      // ignore prompts that profound creates to evaluate Topics.
      const regex = /Evaluate the MongoDB - Docs \/ Education company MongoDB on/
      if (regex.test(currentAnswer.prompt)) {
        return;
      }

      // Find the corresponding llm_cases document (to get expected response & tags)
      const currentPrompt = currentAnswer.prompt;
      const currentPromptId = currentAnswer.prompt_id
      const currentCase = casesByPromptMap[currentPromptId];
      if (!currentCase) {
        console.log(`No case found for ${currentPrompt}`)
      }

      // calculate reference alignment score
      let referenceAlignment;
      try {
        referenceAlignment = await referenceAlignmentFn({ 
          input: {
            messages: [
              {
                role: "user" as const,
                content: currentAnswer.prompt
              }
            ]
          }, 
          output: {
            response: currentAnswer.response,
            links: currentAnswer.citations
          }, 
          expected: {
            reference: currentCase?.expected ?? "",
            links: [] // TODO: where can expected links be found?
          }
        }) as { 
          score: number | null; 
          name: string;
          metadata: {
            rationale: string;
            choice: string;
          }
        };
      } catch (err) {
        console.error('Error in referenceAlignmentFn:', {
          prompt: currentAnswer.prompt,
          response: currentAnswer.response,
          expected: currentCase?.expected,
          error: err
        });
        referenceAlignment = {
          score: null,
          name: 'ReferenceAlignment',
          metadata: {
            rationale: 'Error during evaluation',
            choice: ''
          }
        };
      }

      // create the llm_answers record
      const answerEngineRecord = {
        type: 'answer-engine',
        caseId: currentCase?.caseId ?? null,
        platformName: currentAnswer.model,
        platformId: platformsByNameMap[currentAnswer.model],
        date: new Date(currentAnswer.created_at + 'Z'),
        prompt: currentAnswer.prompt,
        region: currentAnswer.region,
        response: currentAnswer.response,
        metrics: {
          referenceAlignment: {
            score: referenceAlignment.score,
            rationale: referenceAlignment.metadata?.rationale
          },
        },
        citations: Array.from(new Set(currentAnswer.citations)).map((citation) => {
          const url = new URL(citation);
          return {
            url: url.toString(),
            hostname: url.hostname,
            path: url.pathname,
          }
        }),
        tags: currentCase?.tags,
        expectedResponse: currentCase?.expected,
        profoundPromptId: currentAnswer.prompt_id,
        profoundRunId: currentAnswer.run_id,
      };
      answerRecords.push(answerEngineRecord);
      return answerEngineRecord;
    });

  // update the llm_answers collection 
  if (answerRecords.length > 0) {
    const bulkOps = answerRecords.map((record) => ({
      updateOne: {
        filter: { profoundRunId: record.profoundRunId },
        update: { 
          $set: record,
          $setOnInsert: { createdAt: new Date() }
        },
        upsert: true,
      }
    }));
    try {
      const result = await answersCollection.bulkWrite(bulkOps);
      const inserted = result.upsertedCount || 0;
      const updated = result.modifiedCount || 0;
      console.log(`BulkWrite to llm_answers collection completed: ${inserted} inserted, ${updated} updated (out of ${answerRecords.length} records).`);
    } catch (err) {
      console.error('BulkWrite to llm_answers collection failed:', err);
    } finally {
      await client.close();
    }
  }
  if (errors && errors.length > 0) {
    console.error('Errors while getting reference alignment scores:', errors);
  }
};

// Usage documentation for CLI users
if (process.argv.includes('--help')) {
  console.log(`
Usage: node getAndProcessAnswers.js [startDate] [endDate]

Optional arguments:
  startDate   ISO date string (e.g., 2025-06-01). If omitted, defaults to yesterday (UTC).
  endDate     ISO date string (e.g., 2025-06-01). If omitted, defaults to yesterday (UTC).

Date range is inclusive: the start date will have the time set to T00:00:00.000Z and the end date will have the time set to T23:59:59.999Z.

Examples:
  node getAndProcessAnswers.js
  node getAndProcessAnswers.js 2025-06-20
  node getAndProcessAnswers.js 2025-06-20 2025-06-30
`);
  process.exit(0);
}

const [, , startDateArg, endDateArg] = process.argv;
main(startDateArg, endDateArg)
