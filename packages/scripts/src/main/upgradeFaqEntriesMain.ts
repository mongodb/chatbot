import { MongoClient } from "mongodb";
import { assertEnvVars } from "mongodb-rag-core";
import { FaqEntry } from "../findFaq";
import { upgradeFaqEntries, FaqEntryV0 } from "../upgradeFaqEntries";
import { ScrubbedMessage } from "../ScrubbedMessage";

import "dotenv/config";

const {
  FROM_CONNECTION_URI,
  FROM_DATABASE_NAME,
  FROM_FAQ_COLLECTION_NAME,
  FROM_SCRUBBED_COLLECTION_NAME,
  TO_CONNECTION_URI,
  TO_DATABASE_NAME,
  TO_FAQ_COLLECTION_NAME,
} = assertEnvVars({
  FROM_CONNECTION_URI: "",
  FROM_DATABASE_NAME: "",
  FROM_FAQ_COLLECTION_NAME: "",
  FROM_SCRUBBED_COLLECTION_NAME: "",
  TO_CONNECTION_URI: "",
  TO_DATABASE_NAME: "",
  TO_FAQ_COLLECTION_NAME: "",
});

async function main() {
  const fromClient = await MongoClient.connect(FROM_CONNECTION_URI);
  try {
    const toClient = await MongoClient.connect(TO_CONNECTION_URI);
    try {
      const fromDb = fromClient.db(FROM_DATABASE_NAME);
      const fromCollection = fromDb.collection<FaqEntryV0>(
        FROM_FAQ_COLLECTION_NAME
      );
      const scrubbedCollection = fromDb.collection<ScrubbedMessage>(
        FROM_SCRUBBED_COLLECTION_NAME
      );

      const toDb = toClient.db(TO_DATABASE_NAME);
      const toCollection = toDb.collection<FaqEntry>(TO_FAQ_COLLECTION_NAME);

      const entries = await fromCollection
        .find({
          $or: [{ schemaVersion: undefined }, { schemaVersion: { $lte: 0 } }],
        })
        .toArray();

      const upgradedEntries = await upgradeFaqEntries({
        entries,
        async countUserMessages({ from, to }) {
          return await scrubbedCollection.countDocuments({
            $and: [
              { role: "user" },
              { createdAt: { $gte: from } },
              { createdAt: { $lte: to } },
            ],
          });
        },
      });

      const bulkWriteResult = await toCollection.bulkWrite(
        upgradedEntries.map((entry) => ({
          updateOne: {
            filter: { _id: entry._id },
            update: entry,
            upsert: true,
          },
        }))
      );
      console.log(
        `Modified ${bulkWriteResult.modifiedCount}, upserted ${bulkWriteResult.nUpserted}.`
      );
    } finally {
      await toClient.close();
    }
  } finally {
    await fromClient.close();
  }
}

main();
