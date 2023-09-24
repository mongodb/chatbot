import { strict as assert } from "assert";
import { MongoClient, Db } from "mongodb";
import { Conversation, Message } from "chat-server";
import { ScrubbedMessage } from "./ScrubbedMessage";

import "dotenv/config";

async function main() {
  const client = await MongoClient.connect(
    process.env.MONGODB_CONNECTION_URI as string
  );
  try {
    const db = client.db(process.env.MONGODB_DATABASE_NAME as string);
    await addTopics({ db });
  } finally {
    await client.close();
  }
}

main();

const addTopics = async ({ db }: { db: Db }) => {
  const conversationsCollection = db.collection<Conversation>("conversations");

  const originalMessages = conversationsCollection.aggregate<Message>([
    {
      // Find messages in a recent timeframe
      $match: {
        "messages.createdAt": {
          // Originals for older conversations are likely to have been deleted,
          // so we can't use it to get the topic
          $gte: daysBeforeDate(5),
        },
      },
    },
    {
      // With replaceRoot below, pass each message from conversation to next
      // stage in pipeline
      $unwind: "$messages",
    },
    {
      $replaceRoot: { newRoot: "$messages" },
    },
    {
      // Filter out non-user messages
      $match: {
        role: "user",
      },
    },
    {
      // Join with the scrubbed collection in order to find those that need
      // topics
      $lookup: {
        from: "scrubbed_messages",
        localField: "id",
        foreignField: "_id",
        as: "scrubbed",
      },
    },
    {
      // Filter out messages that haven't been scrubbed yet or that already have
      // topics set
      $match: {
        scrubbed: { $ne: [] },
        "scrubbed.topics": { $exists: false },
      },
    },
    { $project: { scrubbed: 0, embedding: 0 } },
  ]);

  for await (const message of originalMessages) {
    await topics(message);
  }
};

const topics = async (message: Message) => {
  assert(message.role !== "system");
};

const daysBeforeDate = (days: number, date = new Date()) =>
  new Date(new Date(date).setDate(date.getDate() - days));
