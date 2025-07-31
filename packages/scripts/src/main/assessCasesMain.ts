import { AzureOpenAI } from "mongodb-rag-core/openai";
import {
  assertEnvVars,
  BRAINTRUST_ENV_VARS,
  makeOpenAiEmbedder,
} from "mongodb-rag-core";
import { MongoClient } from "mongodb";
import { Case } from "../Case";
import { makeSimpleTextGenerator } from "../SimpleTextGenerator";
import "dotenv/config";
import { assessRelevance, makeShortName } from "../assessCases";
import { generateRating } from "../generateRating";
import { models } from "mongodb-rag-core/models";
import { createOpenAI, wrapLanguageModel } from "mongodb-rag-core/aiSdk";

const assessRelevanceMain = async () => {
  const {
    FROM_CONNECTION_URI,
    FROM_DATABASE_NAME,
    OPENAI_API_KEY,
    OPENAI_ENDPOINT,
    OPENAI_API_VERSION,
    OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
    CASE_COLLECTION_NAME,
    BRAINTRUST_API_KEY,
    BRAINTRUST_ENDPOINT,
  } = assertEnvVars({
    FROM_CONNECTION_URI: "",
    FROM_DATABASE_NAME: "",
    OPENAI_API_KEY: "",
    OPENAI_ENDPOINT: "",
    OPENAI_API_VERSION: "",
    OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT: "",
    CASE_COLLECTION_NAME: "",
    ...BRAINTRUST_ENV_VARS,
  });

  const openAiClient = new AzureOpenAI({
    apiKey: OPENAI_API_KEY,
    endpoint: OPENAI_ENDPOINT,
    apiVersion: OPENAI_API_VERSION,
  });

  const embedders = [
    makeOpenAiEmbedder({
      openAiClient,
      deployment: OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
      backoffOptions: {
        numOfAttempts: 25,
        startingDelay: 1000,
      },
    }),
  ];

  const generate = makeSimpleTextGenerator({
    client: openAiClient,
    model: "gpt-4o",
  });

  const judgmentModel = wrapLanguageModel({
    model: createOpenAI({
      apiKey: BRAINTRUST_API_KEY,
      baseURL: BRAINTRUST_ENDPOINT,
    }).chat("o3"),
    middleware: [],
  });

  const openai = createOpenAI({
    apiKey: BRAINTRUST_API_KEY,
    baseURL: BRAINTRUST_ENDPOINT,
  }).chat(llmOptions.model, {
    structuredOutputs: true,
  });
  const client = await MongoClient.connect(FROM_CONNECTION_URI);
  try {
    console.log(
      `Fetching cases ${FROM_DATABASE_NAME}.${CASE_COLLECTION_NAME}...`
    );
    const db = client.db(FROM_DATABASE_NAME);
    const collection = db.collection<Case>(CASE_COLLECTION_NAME);
    const cases = await collection.find().toArray();
    const relevancePromises = cases.map(
      async ({ _id, name: prompt, expected: expectedResponse }) => {
        const shortName = makeShortName(prompt);
        const relevance = await assessRelevance({
          prompt,
          expectedResponse,
          embedders,
          generate,
        });

        models.find(({ deployment }) => deployment === "o3");
        const llm_as_judgment = await generateRating({
          prompt,
          expectedResponse,
          model: judgmentModel,
        });
        console.log(`Updating '${shortName}'...`);
        const updateResult = await collection.updateOne(
          {
            _id,
          },
          {
            $set: {
              relevance,
              llm_as_judgment,
            },
          }
        );

        if (updateResult.modifiedCount === 1) {
          console.log(`Updated '${shortName}'.`);
        } else {
          console.warn(`Failed to update '${shortName}' (${_id})`);
        }
      }
    );

    await Promise.allSettled(relevancePromises);
  } finally {
    await client.close();
  }
};

assessRelevanceMain();
