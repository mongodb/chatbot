import { MongoClient, ObjectId } from "mongodb";
import { assertEnvVars } from "mongodb-rag-core";
import { Message } from "mongodb-chatbot-server";

import "dotenv/config";

const { MONGODB_DATABASE_NAME, MONGODB_CONNECTION_URI } = assertEnvVars({
  MONGODB_DATABASE_NAME: "",
  MONGODB_CONNECTION_URI: "",
});

const NUM_REFERENCES = 250;

export type TopReference = {
  _id: string;
  count: number;
  conversationIds: ObjectId[];
  messages: (Message & {
    conversationId: ObjectId;
    messageId: ObjectId;
    index: number;
  })[];
};

(async function main() {
  const client = await MongoClient.connect(MONGODB_CONNECTION_URI);
  try {
    const db = client.db(MONGODB_DATABASE_NAME);
    await db.createCollection<TopReference>(
      `top_${NUM_REFERENCES}_references`,
      {
        viewOn: "conversations",
        pipeline: [
          {
            $match: {
              "messages.role": "user",
            },
          },
          {
            $unwind: {
              path: "$messages",
              includeArrayIndex: "messageIndex",
            },
          },
          {
            $match: {
              "messages.role": "assistant",
              "messages.references.0": {
                $exists: true,
              },
            },
          },
          {
            $addFields: {
              references: "$messages.references",
            },
          },
          {
            $unwind: {
              path: "$references",
              includeArrayIndex: "referenceIndex",
            },
          },
          {
            $group: {
              _id: "$references.title",
              count: {
                $sum: 1,
              },
              conversationIds: {
                $addToSet: "$_id",
              },
              messages: {
                $push: {
                  $mergeObjects: [
                    "$messages",
                    {
                      conversationId: "$_id",
                      messageId: "$messages.id",
                      index: "$messageIndex",
                    },
                  ],
                },
              },
            },
          },
          {
            $sort: {
              count: -1,
            },
          },
          {
            $limit: NUM_REFERENCES,
          },
        ],
      }
    );
  } finally {
    await client.close();
  }
})();
