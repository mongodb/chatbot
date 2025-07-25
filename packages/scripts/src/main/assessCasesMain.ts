import { AzureOpenAI } from "mongodb-rag-core/openai";
import { assertEnvVars, makeOpenAiEmbedder } from "mongodb-rag-core";
import { MongoClient } from "mongodb";
import { Case } from "../Case";
import { makeSimpleTextGenerator } from "../SimpleTextGenerator";
import "dotenv/config";
import { assessRelevance, makeShortName, rateWithLlm } from "../assessCases";

const assessRelevanceMain = async () => {
  const {
    FROM_CONNECTION_URI,
    FROM_DATABASE_NAME,
    OPENAI_API_KEY,
    OPENAI_ENDPOINT,
    OPENAI_API_VERSION,
    OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
    CASE_COLLECTION_NAME,
  } = assertEnvVars({
    FROM_CONNECTION_URI: "",
    FROM_DATABASE_NAME: "",
    OPENAI_API_KEY: "",
    OPENAI_ENDPOINT: "",
    OPENAI_API_VERSION: "",
    OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT: "",
    CASE_COLLECTION_NAME: "",
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

  const client = await MongoClient.connect(FROM_CONNECTION_URI);
  try {
    console.log(
      `Fetching unscored cases from ${FROM_DATABASE_NAME}.${CASE_COLLECTION_NAME}...`
    );
    const db = client.db(FROM_DATABASE_NAME);
    const collection = db.collection<Case>(CASE_COLLECTION_NAME);
    const cases = await collection.find().toArray();
    const relevancePromises = cases.map(
      async ({ _id, name: prompt, expected }) => {
        const shortName = makeShortName(prompt);
        const relevance = await assessRelevance({
          prompt,
          expected,
          embedders,
          generate,
        });
        const llm_as_judgment = await rateWithLlm({
          prompt,
          expected,
          generate,
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
