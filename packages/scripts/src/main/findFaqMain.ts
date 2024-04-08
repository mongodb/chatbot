import { ObjectId, WithId, MongoClient } from "mongodb";
import { assertEnvVars } from "mongodb-rag-core";
import { Conversation } from "mongodb-chatbot-server";
import {
  findFaq,
  FaqEntry,
  assignFaqIds,
  makeFaqVectorStoreCollectionWrapper,
} from "../findFaq";

import "dotenv/config";

const {
  FROM_CONNECTION_URI,
  FROM_DATABASE_NAME,
  TO_DATABASE_NAME,
  TO_CONNECTION_URI,
  TO_FAQ_COLLECTION_NAME,
} = assertEnvVars({
  FROM_CONNECTION_URI: "",
  FROM_DATABASE_NAME: "",
  TO_CONNECTION_URI: "",
  TO_DATABASE_NAME: "",
  TO_FAQ_COLLECTION_NAME: "",
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

  const fromClient = await MongoClient.connect(FROM_CONNECTION_URI);
  try {
    const toClient = await MongoClient.connect(TO_CONNECTION_URI);

    try {
      const toDb = toClient.db(TO_DATABASE_NAME);
      const faqCollection = toDb.collection<
        WithId<FaqEntry & { created: Date; epsilon: number }>
      >(TO_FAQ_COLLECTION_NAME);
      const created = new Date();

      const fromDb = fromClient.db(FROM_DATABASE_NAME);
      const conversationsCollection =
        fromDb.collection<Conversation>("conversations");

      // Associate each question with an ID to track questions across runs of
      // findFaq
      await findFaq({
        conversationsCollection,
        clusterizeOptions: {
          epsilon,
        },
        snapshotWindowDays: 5,
      })
        .then((faqEntries) => {
          // Associate each question with an ID to track questions across runs of
          // findFaq
          return assignFaqIds({
            faqEntries,
            faqStore: makeFaqVectorStoreCollectionWrapper(faqCollection),
          });
        })
        .then(async (faqEntries) => {
          // Add info to prepare for database insert
          return faqEntries.map((q) => ({
            ...q,
            epsilon,
            created,
            _id: new ObjectId(),
          }));
        })
        .then(async (faqEntries) => {
          // Insert into database
          const insertResult = await faqCollection.insertMany(faqEntries);
          console.log(`Inserted ${insertResult.insertedCount} FAQ entries.`);
        });
    } finally {
      await toClient.close();
    }
  } finally {
    await fromClient.close();
  }
}

main();
