import { MongoClient } from "mongodb";
import { assertEnvVars } from "mongodb-rag-core";

import "dotenv/config";

const { MONGODB_DATABASE_NAME, MONGODB_CONNECTION_URI } = assertEnvVars({
  MONGODB_DATABASE_NAME: "",
  MONGODB_CONNECTION_URI: "",
});

export type ScrubbedTopics = {
  _id: string;
  count: number;
};

(async function main() {
  const client = await MongoClient.connect(MONGODB_CONNECTION_URI);
  try {
    const db = client.db(MONGODB_DATABASE_NAME);
    await db.createCollection<ScrubbedTopics>("scrubbed_topics", {
      viewOn: "scrubbed_messages",
      pipeline: [
        {
          $match: {
            "analysis.topics": {
              $exists: true,
            },
          },
        },
        {
          $unwind: {
            path: "$analysis.topics",
            includeArrayIndex: "topicIndex",
          },
        },
        {
          $group: {
            _id: "$analysis.topics",
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ],
    });
  } finally {
    await client.close();
  }
})();
