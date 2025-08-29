import "dotenv/config";
import { getEnv } from "mongodb-rag-core";
import { MongoClient } from "mongodb";
import { createOpenAI, wrapLanguageModel, azure } from "mongodb-rag-core/aiSdk";
import { BraintrustMiddleware } from "mongodb-rag-core/braintrust";
import z from "zod";
import {
  makeAnalyzeCases,
  promptResponseRatingSchema,
  relevanceSchema,
} from "mercury-case-analysis";

export const caseSchema = z.object({
  type: z.string(),
  tags: z.string().array(),
  name: z.string(),
  prompt: z
    .object({
      content: z.string(),
      role: z.string(),
    })
    .array(),
  expected: z.string(),

  // Fields to add
  prompt_relevance: relevanceSchema.optional(),
  prompt_quality: promptResponseRatingSchema.optional(),
});

export type Case = z.infer<typeof caseSchema>;

const assessRelevanceMain = async () => {
  const {
    MERCURY_CONNECTION_URI,
    MERCURY_DATABASE_NAME,
    MERCURY_CASES_COLLECTION_NAME,
    MERCURY_GENERATOR_MODEL_NAME,
    MERCURY_JUDGEMENT_MODEL_NAME,
    OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
    BRAINTRUST_API_KEY,
    BRAINTRUST_PROXY_ENDPOINT,
  } = getEnv({
    required: [
      "MERCURY_CONNECTION_URI",
      "MERCURY_DATABASE_NAME",
      "MERCURY_CASES_COLLECTION_NAME",
      "MERCURY_GENERATOR_MODEL_NAME",
      "MERCURY_JUDGEMENT_MODEL_NAME",
      "OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT",
      "BRAINTRUST_API_KEY",
      "BRAINTRUST_PROXY_ENDPOINT",
    ],
  });

  const model = createOpenAI({
    apiKey: BRAINTRUST_API_KEY,
    baseURL: BRAINTRUST_PROXY_ENDPOINT,
  }).textEmbeddingModel(OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT);
  const analyzeCases = makeAnalyzeCases({
    embeddingModels: [
      createOpenAI({
        apiKey: BRAINTRUST_API_KEY,
        baseURL: BRAINTRUST_PROXY_ENDPOINT,
      }).textEmbeddingModel(OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT),
    ],
    generatorModel: wrapLanguageModel({
      model: createOpenAI({
        apiKey: BRAINTRUST_API_KEY,
        baseURL: BRAINTRUST_PROXY_ENDPOINT,
      }).chat(MERCURY_GENERATOR_MODEL_NAME),
      middleware: [BraintrustMiddleware({ debug: true })],
    }),
    judgementModel: wrapLanguageModel({
      model: createOpenAI({
        apiKey: BRAINTRUST_API_KEY,
        baseURL: BRAINTRUST_PROXY_ENDPOINT,
      }).chat(MERCURY_JUDGEMENT_MODEL_NAME),
      middleware: [BraintrustMiddleware({ debug: true })],
    }),
  });

  const client = await MongoClient.connect(MERCURY_CONNECTION_URI);
  try {
    console.log(
      `Assessing Cases from ${MERCURY_DATABASE_NAME}.${MERCURY_CASES_COLLECTION_NAME}...`,
    );
    const db = client.db(MERCURY_DATABASE_NAME);
    const collection = db.collection<Case>(MERCURY_CASES_COLLECTION_NAME);
    const cases = await collection.find().toArray();

    console.log(`# cases`, cases.length);

    const results = await analyzeCases({
      cases: cases.map((c) => ({
        prompt: c.name,
        response: c.expected,
      })),
    });
    console.log(results);

    const bulkUpdates = results.map((r, idx) => ({
      updateOne: {
        filter: { _id: cases[idx]._id },
        update: {
          $set: {
            prompt_relevance: r.relevance,
            prompt_quality: r.quality,
          },
        },
      },
    }));

    await collection.bulkWrite(bulkUpdates);
  } finally {
    await client.close();
  }
};

assessRelevanceMain();
