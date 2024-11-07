import Path from "path";
import { strict as assert } from "assert";
import { promises as fs } from "fs";
import { assertEnvVars } from "mongodb-rag-core";
import { MongoClient, Db, ObjectId } from "mongodb-rag-core/mongodb";
import {
  Conversation,
  Message,
  AssistantMessage,
} from "mongodb-chatbot-server";
import { MessageAnalysis } from "./MessageAnalysis";

import "dotenv/config";
import { makeTypeChatJsonTranslateFunc } from "./TypeChatJsonTranslateFunc";

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
  const originalMessages = conversationsCollection.aggregate<
    Message & { indexInConvo: number; convoId: ObjectId }
  >([
    {
      // Find messages in a recent timeframe
      $match: {
        "messages.createdAt": {
          // Originals for older conversations are likely to have been deleted,
          // so we can't use it to get the topic
          $gte: daysBeforeDate(8),
        },
        // Include only conversations that actually had user input
        "messages.role": "user",
      },
    },
    {
      // With replaceRoot below, pass each message from conversation to next
      // stage in pipeline
      $unwind: {
        path: "$messages",
        includeArrayIndex: "indexInConvo",
      },
    },
    {
      $addFields: {
        "messages.indexInConvo": "$indexInConvo",
        "messages.convoId": "$_id",
      },
    },
    {
      $replaceRoot: { newRoot: "$messages" },
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
      // analysis set. (Run scrubMessages first to populate scrubbed messages.)
      $match: {
        scrubbed: { $ne: [] },
        "scrubbed.analysis": { $exists: false },
      },
    },
    {
      $project: {
        scrubbed: 0,
        embedding: 0,
      },
    },
    { $sort: { convoId: 1, createdAt: 1 } },
  ]);

  const analyze = await makeAnalyzer();
  const scrubbedCollection = db.collection<Conversation>("scrubbed_messages");

  let lastUserMessage:
    | { convoId: ObjectId; indexInConvo: number; id: ObjectId }
    | undefined = undefined;

  for await (const message of originalMessages) {
    if (message.role === "system") {
      // Do not analyze system messages (for now?)
      continue;
    }
    if (message.role === "assistant") {
      const assistantMessage = message as AssistantMessage;
      // If this is a response to the previous message and it has a rating, copy
      // the rating to the responseRating field of the previous message
      if (
        lastUserMessage?.convoId.toString() === message.convoId.toString() &&
        lastUserMessage?.indexInConvo === message.indexInConvo - 1 &&
        assistantMessage.rating !== undefined
      ) {
        console.log(
          `Copying rating (${message.rating}) to conversation ${lastUserMessage.convoId} message #${lastUserMessage.indexInConvo} from message #${message.indexInConvo}...`
        );
        const result = await scrubbedCollection.updateOne(
          { _id: lastUserMessage.id },
          { $set: { responseRating: message.rating } }
        );
        console.log(
          `Result acknowledged: ${result.acknowledged}; modified count: ${result.modifiedCount}`
        );
      }
      lastUserMessage = undefined;
      continue;
    }

    assert(
      message.role === "user",
      `Unexpected non-user role message: ${JSON.stringify(message)}`
    );
    lastUserMessage = {
      ...message,
    };

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
