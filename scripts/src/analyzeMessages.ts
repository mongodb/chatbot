import Path from "path";
import { promises as fs } from "fs";
import { MongoClient, Db } from "mongodb";
import { Conversation, Message } from "chat-server";
import { makeTypeChatJsonTranslateFunc, assertEnvVars } from "chat-core";
import { MessageAnalysis } from "./MessageAnalysis";

import "dotenv/config";

const {
  MONGODB_DATABASE_NAME,
  MONGODB_CONNECTION_URI,
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_CHAT_COMPLETION_MODEL_VERSION,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
} = assertEnvVars({
  MONGODB_DATABASE_NAME: "",
  MONGODB_CONNECTION_URI: "",
  OPENAI_ENDPOINT: "",
  OPENAI_API_KEY: "",
  OPENAI_CHAT_COMPLETION_MODEL_VERSION: "",
  OPENAI_CHAT_COMPLETION_DEPLOYMENT: "",
});

async function main() {
  const client = await MongoClient.connect(MONGODB_CONNECTION_URI);
  try {
    const db = client.db(MONGODB_DATABASE_NAME);
    await analyzeMessages({ db });
  } finally {
    await client.close();
  }
}

main();

const analyzeMessages = async ({ db }: { db: Db }) => {
  const conversationsCollection = db.collection<Conversation>("conversations");
  const originalMessages = conversationsCollection.aggregate<Message>([
    {
      // Find messages in a recent timeframe
      $match: {
        "messages.createdAt": {
          // Originals for older conversations are likely to have been deleted,
          // so we can't use it to get the topic
          $gte: daysBeforeDate(8),
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
      // analysis
      $lookup: {
        from: "scrubbed_messages",
        localField: "id",
        foreignField: "_id",
        as: "scrubbed",
      },
    },
    {
      // Filter out messages that haven't been scrubbed yet or that already have
      // analysis set
      $match: {
        scrubbed: { $ne: [] },
        "scrubbed.analysis": { $exists: false },
      },
    },
    { $project: { scrubbed: 0, embedding: 0 } },
  ]);

  const analyze = await makeAnalyzer();
  const scrubbedCollection = db.collection<Conversation>("scrubbed_messages");

  for await (const message of originalMessages) {
    try {
      console.log(`Analyzing ${message.id}...`);
      const analysis = await analyze(message.content);
      console.log(`Analysis complete: ${JSON.stringify(analysis)}`);
      console.log("Saving analysis...");
      const result = await scrubbedCollection.updateOne(
        { _id: message.id },
        { $set: { analysis } }
      );
      console.log(
        `Result acknowledged: ${result.acknowledged}; modified count: ${result.modifiedCount}`
      );
    } catch (error) {
      console.error(
        `Analyze & save failed for ${message.id}: ${(error as Error).message}`
      );
    }
  }
};

const daysBeforeDate = (days: number, date = new Date()) =>
  new Date(new Date(date).setDate(date.getDate() - days));

const makeAnalyzer = async () => {
  const schemaName = "MessageAnalysis";
  const schema = await fs.readFile(
    Path.join(__dirname, `${schemaName}.d.ts`),
    "utf8"
  );

  const translate = makeTypeChatJsonTranslateFunc<MessageAnalysis>({
    azureOpenAiServiceConfig: {
      apiKey: OPENAI_API_KEY,
      baseUrl: OPENAI_ENDPOINT,
      deployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
      version: OPENAI_CHAT_COMPLETION_MODEL_VERSION,
    },
    schemaName,
    schema,
    numRetries: 5,
  });

  return translate;
};
