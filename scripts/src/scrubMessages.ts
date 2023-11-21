import { MongoClient, Db, Collection, Document } from "mongodb";
import {
  Conversation,
  Message,
  UserMessage,
  AssistantMessage,
  SystemMessage,
} from "mongodb-chatbot-server";
import { ScrubbedMessage } from "./ScrubbedMessage";

import "dotenv/config";

async function main() {
  const client = await MongoClient.connect(
    process.env.MONGODB_CONNECTION_URI as string
  );
  try {
    const db = client.db(process.env.MONGODB_DATABASE_NAME as string);
    await scrubMessages({ db });
  } finally {
    await client.close();
  }
}

main();

const scrubMessages = async ({ db }: { db: Db }) => {
  const scrubbedCollection =
    db.collection<ScrubbedMessage>("scrubbed_messages");

  // Find latest saved content
  console.log("Finding latest scrubbed message date...");
  const since = await findLatestScrubDate({ scrubbedCollection });

  console.log(
    since
      ? `Latest scrubbed message date: ${since}`
      : "No scrubbed messages found. Scrubbing from the dawn of time."
  );

  // Construct aggregation pipeline
  const pipeline: Document[] = [];

  if (since !== undefined) {
    pipeline.push({
      $match: {
        "messages.createdAt": { $gte: since },
      },
    });
  }

  pipeline.push(
    {
      $unwind: {
        path: "$messages",
        includeArrayIndex: "index",
      },
    },
    {
      $project: {
        _id: "$messages.id", // FIXME: why inconsistent usage of _id vs. id?
        conversationId: "$_id",
        ipAddress: 1,
        index: 1,
        createdAt: "$messages.createdAt",
        role: "$messages.role",
        embedding: "$messages.embedding",
        rating: "$messages.rating",
        references: "$messages.references",
        rejectQuery: "$messages.rejectQuery",
      } satisfies Record<
        Exclude<
          // This protects against unknown entries in the $project stage and
          // ensures all of the fields that we do want are projected. We can't
          // just use ScrubbedMessage/SomeMessage because we want the union of
          // all possible Message-type keys.
          | keyof UserMessage
          | keyof AssistantMessage
          | keyof SystemMessage
          | keyof ScrubbedMessage,
          // Add keys to omit from the projection below.
          | "id"
          | "content"
          | "preprocessedContent"
          | "analysis"
          | "responseRating"
        >,
        string | number
      >,
    },
    {
      $merge: {
        into: "scrubbed_messages",
        whenMatched: "merge",
        whenNotMatched: "insert",
      },
    }
  );
  try {
    console.log("Running aggregation pipeline...");
    await db
      .collection<Conversation>("conversations")
      .aggregate(pipeline)
      .toArray();
    console.log("Aggregation complete.");
  } catch (error) {
    console.error(
      `Aggregation failed with message: ${(error as Error)?.message}`
    );
  }
};

const findLatestScrubDate = async ({
  scrubbedCollection,
}: {
  scrubbedCollection: Collection<ScrubbedMessage>;
}): Promise<Date | undefined> => {
  return (
    await scrubbedCollection.find().sort({ createdAt: -1 }).limit(1).toArray()
  )[0]?.createdAt;
};
