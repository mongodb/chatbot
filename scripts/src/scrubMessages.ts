import { MongoClient, Db, Collection, ObjectId, Document } from "mongodb";
import { Conversation, Message } from "chat-server";

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

export type ScrubbedMessage = Omit<
  Message,
  "content" | "preprocessedContent" | "id"
> & {
  _id: ObjectId;

  /**
    The ID of the original conversation.
   */
  conversationId: ObjectId;

  /**
    The IP address of the user in the conversation.
   */
  ipAddress: string;

  /**
    The ordinal number of this message in relation to other messages in the original conversation.
   */
  index: number;
};

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
        _id: "$messages.id",
        conversationId: "$_id",
        ipAddress: 1,
        index: 1,
        createdAt: "$messages.createdAt",
        role: "$messages.role",
        embedding: "$messages.embedding",
        rating: "$messages.rating",
        references: "$messages.references",
      },
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
