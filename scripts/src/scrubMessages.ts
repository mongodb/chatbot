import { MongoClient, Db, Collection, ObjectId } from "mongodb";
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

  // Find conversations since last scrub date
  console.log("Loading conversations...");
  const conversations = await findConversations({ since, db });

  console.log(
    `Found ${conversations.length} conversations since ${
      since ? "last scrub date" : "dawn of time"
    }`
  );

  if (conversations.length === 0) {
    console.log("Nothing to scrub.");
    return;
  }

  // Extract and scrub all messages of their real content so that information
  // about the messages may be kept permanently regardless of whether the
  // content had PII.
  console.log("Scrubbing messages...");
  const messages = conversations
    .map(({ _id: conversationId, ipAddress, messages }) =>
      messages.map(
        (
          { id: _id, createdAt, role, embedding, rating, references },
          index
        ): ScrubbedMessage => ({
          _id,
          conversationId,
          ipAddress,
          index,
          createdAt,
          role,
          embedding,
          rating,
          references,
        })
      )
    )
    .flat(1);
  console.log(`Scrubbed ${messages.length} messages`);

  // Save scrubbed messages
  console.log(`Inserting scrubbed messages...`);
  try {
    const result = await scrubbedCollection.insertMany(messages, {
      ignoreUndefined: true,
      ordered: false,
    });
    console.log(`Insert acknowledged: ${result.acknowledged}`);
    console.log(`Inserted ${result.insertedCount} scrubbed messages`);
  } catch (error) {
    console.error(`Insert failed with message: ${(error as Error).message}`);
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

const findConversations = async ({
  db,
  since,
}: {
  db: Db;
  since?: Date;
}): Promise<Conversation[]> => {
  const conversationCollection = db.collection<Conversation>("conversations");
  return await conversationCollection
    .find(since !== undefined ? { "messages.createdAt": { $gt: since } } : {})
    .toArray();
};
