import { MongoClient, ObjectId } from "mongodb";
import { assertEnvVars } from "mongodb-rag-core";
import { ScrubbedMessage } from "../ScrubbedMessage";

import "dotenv/config";

const { MONGODB_DATABASE_NAME, MONGODB_CONNECTION_URI } = assertEnvVars({
  MONGODB_DATABASE_NAME: "",
  MONGODB_CONNECTION_URI: "",
});

type Rating = true | false | null;

export type ScrubbedMessageByRating = {
  _id: Rating;
  rating: Rating;
  count: number;
  uniqueIps: string[];
  conversationIds: ObjectId[];
  messages: (ScrubbedMessage & {
    conversationId: ObjectId;
    messageId: ObjectId;
    index: number;
  })[];
};

(async function main() {
  const client = await MongoClient.connect(MONGODB_CONNECTION_URI);
  try {
    const db = client.db(MONGODB_DATABASE_NAME);
    await db.createCollection<ScrubbedMessageByRating>(
      "scrubbed_messages_by_rating",
      {
        viewOn: "scrubbed_messages",
        pipeline: [
          {
            $match: {
              role: "assistant",
            },
          },
          {
            $group: {
              _id: "$rating",
              rating: { $first: "$rating" },
              count: {
                $sum: 1,
              },
              uniqueIps: {
                $addToSet: "$ipAddress",
              },
              conversationIds: {
                $addToSet: "$conversationId",
              },
              messages: {
                $push: {
                  $mergeObjects: [
                    "$$ROOT",
                    {
                      messageId: "$_id",
                    },
                  ],
                },
              },
            },
          },
        ],
      }
    );
  } finally {
    await client.close();
  }
})();
