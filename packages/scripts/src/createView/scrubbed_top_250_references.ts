import { MongoClient, ObjectId } from "mongodb";
import { assertEnvVars } from "mongodb-rag-core";
import { ScrubbedMessage } from "../ScrubbedMessage";

import "dotenv/config";

const { MONGODB_DATABASE_NAME, MONGODB_CONNECTION_URI } = assertEnvVars({
  MONGODB_DATABASE_NAME: "",
  MONGODB_CONNECTION_URI: "",
});

const NUM_REFERENCES = 250;

export type ScrubbedTopReference = {
  _id: string;
  count: number;
  conversationIds: ObjectId[];
  messages: (ScrubbedMessage & {
    messageId: ObjectId;
  })[];
};

(async function main() {
  const client = await MongoClient.connect(MONGODB_CONNECTION_URI);
  try {
    const db = client.db(MONGODB_DATABASE_NAME);
    await db.createCollection<ScrubbedTopReference>(
      `scrubbed_top_${NUM_REFERENCES}_references`,
      {
        viewOn: "scrubbed_messages",
        pipeline: [
          {
            $match: {
              role: "assistant",
              "references.0": {
                $exists: true,
              },
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
                    "$$ROOT",
                    {
                      messageId: "$_id",
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
