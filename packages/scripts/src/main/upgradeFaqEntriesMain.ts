import {
  MongoClient,
  WithId,
  AnyBulkWriteOperation,
} from "mongodb-rag-core/mongodb";
import { assertEnvVars } from "mongodb-rag-core";
import { upgradeFaqEntry, FaqEntry, FaqEntryV0 } from "../upgradeFaqEntries";
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

type SnapshotCache = {
  questionsFromFaq: Record<string, { createdAt: string }[]>;
  counts: Record<string, number>;
};

async function main() {
  const snapshotCache: SnapshotCache = {
    questionsFromFaq: {},
    counts: {},
  };

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

      console.log(`Finding resume point...`);
      const latestUpgradedEntry = await toCollection.findOne(
        {},
        { sort: { created: -1 } }
      );
      console.log(
        latestUpgradedEntry == null
          ? "No resume point found."
          : `Resuming from ${latestUpgradedEntry.created}.`
      );

      console.log(`Loading entries...`);
      const entries = fromCollection.find(
        latestUpgradedEntry == null
          ? {}
          : { created: { $gte: latestUpgradedEntry.created } },
        { sort: { created: 1 } }
      );
      let bulk: AnyBulkWriteOperation<FaqEntry>[] = [];

      const write = async () => {
        const bulkWriteResult = await toCollection.bulkWrite(bulk);
        console.log(
          `Modified ${bulkWriteResult.modifiedCount}, upserted ${bulkWriteResult.upsertedCount}.`
        );
      };
      for await (const entry of entries) {
        const { _id } = entry;
        const alreadyUpgradedInToCollection =
          (await toCollection.findOne({
            _id,
            schemaVersion: 1,
          })) !== null;
        if (alreadyUpgradedInToCollection) {
          console.log(`Already upgraded ${_id}, skipping...`);
          continue;
        }
        console.log(`Upgrading ${_id}...`);
        const upgradedEntry = await upgradeFaqEntry({
          entry,
          async findQuestionsFromFaqDate(created) {
            const utcString = created.toUTCString();
            const cacheEntry = snapshotCache.questionsFromFaq[utcString];
            if (cacheEntry !== undefined) {
              return cacheEntry.map(({ createdAt }) => ({
                createdAt: new Date(createdAt),
              }));
            }
            // Load all questions from all FAQs from this snapshot
            console.log(`Loading questions for faq snapshot ${utcString}...`);
            const questions = (await fromCollection.find({ created }).toArray())
              .map(({ questions }) =>
                questions.map((question) => ({
                  createdAt: question.createdAt.toUTCString(),
                }))
              )
              .flat(1);
            snapshotCache.questionsFromFaq[utcString] = questions;
            return questions.map(({ createdAt }) => ({
              createdAt: new Date(createdAt),
            }));
          },
          async countUserMessages({ from, to }) {
            const rangeId = `${from.getTime()}_to_${to.getTime()}`;
            if (snapshotCache.counts[rangeId] !== undefined) {
              return snapshotCache.counts[rangeId];
            }

            // FAQ entries did not include noise (non-FAQ) questions, so look at
            // scrubbed to get all messages from that date range
            console.log(`Counting user messages for range ${rangeId}...`);
            const count = await scrubbedCollection.countDocuments({
              $and: [
                { role: "user" },
                { createdAt: { $gte: from } },
                { createdAt: { $lte: to } },
              ],
            });

            snapshotCache.counts[rangeId] = count;
            return count;
          },
        });
        bulk.push({
          replaceOne: {
            filter: { _id },
            replacement:
              upgradedEntry ?? (entry as unknown as WithId<FaqEntry>),
            upsert: true,
          },
        });

        if (bulk.length >= 20) {
          await write();
          bulk = [];
        }
      }

      if (bulk.length !== 0) {
        await write();
        bulk = [];
      }
    } finally {
      await toClient.close();
    }
  } finally {
    await fromClient.close();
  }
}

main();
