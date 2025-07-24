import { AzureOpenAI } from "mongodb-rag-core/openai";
import { assertEnvVars, makeOpenAiEmbedder } from "mongodb-rag-core";
import { MongoClient } from "mongodb";
import { Case } from "./Case";

import "dotenv/config";

/**
  Find prompts in llm_cases that don't have embeddings populated yet and populate them.
 */
async function main() {
  const {
    FROM_CONNECTION_URI,
    FROM_DATABASE_NAME,
    OPENAI_API_KEY,
    OPENAI_ENDPOINT,
    OPENAI_API_VERSION,
    OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
  } = assertEnvVars({
    FROM_CONNECTION_URI: "",
    FROM_DATABASE_NAME: "",
    OPENAI_API_KEY: "",
    OPENAI_ENDPOINT: "",
    OPENAI_API_VERSION: "",
    OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT: "",
  });

  const embedder = makeOpenAiEmbedder({
    openAiClient: new AzureOpenAI({
      apiKey: OPENAI_API_KEY,
      endpoint: OPENAI_ENDPOINT,
      apiVersion: OPENAI_API_VERSION,
    }),
    deployment: OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
    backoffOptions: {
      numOfAttempts: 25,
      startingDelay: 1000,
    },
  });

  const client = await MongoClient.connect(FROM_CONNECTION_URI);
  try {
    const db = client.db(FROM_DATABASE_NAME);
    const collection = db.collection<Case>("llm_cases");

    const cases = await collection
      .find({ prompt_embeddings: undefined })
      .toArray();

    const embedPromises = cases.map(async ({ name, _id }) => {
      const shortName = name.length > 32 ? name.slice(0, 29) + "..." : name;
      console.log(`Embedding '${shortName}'...`);
      const { embedding } = await embedder.embed({
        text: name,
      });
      console.log(`Updating '${shortName}'...`);
      const updateResult = await collection.updateOne(
        {
          _id,
        },
        {
          $set: {
            prompt_embeddings: {
              [OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT]: embedding,
            },
          },
        }
      );

      if (updateResult.modifiedCount === 1) {
        console.log(`Updated '${shortName}'.`);
      } else {
        console.warn(`Failed to update '${shortName}' (${_id})`);
      }
    });

    await Promise.allSettled(embedPromises);
  } finally {
    await client.close();
  }
}

main();
