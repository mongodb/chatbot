import { MongoClient, ObjectId } from "mongodb";
import { assertEnvVars } from "mongodb-rag-core";
import { Message } from "mongodb-chatbot-server";

import "dotenv/config";

const { MONGODB_DATABASE_NAME, MONGODB_CONNECTION_URI } = assertEnvVars({
  MONGODB_DATABASE_NAME: "",
  MONGODB_CONNECTION_URI: "",
});

type Rating = true | false | null;

export type MessageByRating = {
  _id: Rating;
  rating: Rating;
  count: number;
  uniqueIps: string[];
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
    await db.createCollection<MessageByRating>("messages_by_rating", {
      viewOn: "conversations",
      pipeline: [
        {
          $match: {
            messages: {
              $elemMatch: {
                role: "user",
              },
            },
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
          },
        },
        {
          $group: {
            _id: "$messages.rating",
            count: {
              $sum: 1,
            },
            uniqueIps: {
              $addToSet: "$ipAddress",
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
          $addFields: {
            rating: "$_id",
          },
        },
      ],
    });
  } finally {
    await client.close();
  }
})();
