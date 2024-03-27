import { ObjectId, WithId, MongoClient } from "mongodb";
import { assertEnvVars } from "mongodb-rag-core";
import {
  findFaq,
  FaqEntry,
  assignFaqIds,
  makeFaqVectorStoreCollectionWrapper,
} from "../findFaq";

import "dotenv/config";

const { MONGODB_DATABASE_NAME, MONGODB_CONNECTION_URI } = assertEnvVars({
  MONGODB_DATABASE_NAME: "",
  MONGODB_CONNECTION_URI: "",
  OPENAI_ENDPOINT: "",
  OPENAI_API_KEY: "",
  OPENAI_CHAT_COMPLETION_MODEL_VERSION: "",
  OPENAI_CHAT_COMPLETION_DEPLOYMENT: "",
});

async function main() {
  const args = process.argv.slice(-2);
  if (args[1] === "--epsilon") {
    throw new Error("Expected 1 argument to --epsilon flag");
  }

  const epsilon = args[0] === "--epsilon" ? Number.parseFloat(args[1]) : 0.05;

  if (Number.isNaN(epsilon) || epsilon <= 0) {
    throw new Error(
      `Failed to parse epsilon value: ${args[1]}. Epsilon must be a floating point value > 0.`
    );
  }

  const client = await MongoClient.connect(MONGODB_CONNECTION_URI);
  try {
    const db = client.db(MONGODB_DATABASE_NAME);
    const faqCollection =
      db.collection<WithId<FaqEntry & { created: Date; epsilon: number }>>(
        "faq"
      );
    const created = new Date();

    // Associate each question with an ID to track questions across runs of
    // findFaq
    await findFaq({
      db,
      clusterizeOptions: {
        epsilon,
      },
    })
      .then(async (faq) => {
        // Associate each question with an ID to track questions across runs of
        // findFaq
        return assignFaqIds({
          faq,
          faqCollection,
          backportNewIds: true,
        });
      })
      .then(async (faq) => {
        // Add info to prepare for database insert
        return faq.map((q) => ({
          ...q,
          epsilon,
          created,
          _id: new ObjectId(),
        }));
      })
      .then(async (faq) => {
        // Insert into database
        const insertResult = await faqCollection.insertMany(faq);
        console.log(`Inserted ${insertResult.insertedCount} FAQ entries.`);
      });
  } finally {
    await client.close();
  }
}

main();
