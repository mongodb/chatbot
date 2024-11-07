import "dotenv/config";
import { assertEnvVars } from "mongodb-rag-core";
import { MongoClient, Document } from "mongodb-rag-core/mongodb";
import { ensureCollectionWithIndex } from "./materializedViewUtils";

export type ScrubbedMessageStatsGranularity = "daily" | "weekly" | "monthly";

type ScrubbedMessageStats<T> = T &
  Document & {
    granularity: ScrubbedMessageStatsGranularity;
    date: Date;
    numMessages: number;
    numConversations: number;
  };

type MakeCreateStatsMaterializedViewParams = {
  client: MongoClient;
  databaseName: string;
  messagesCollectionName?: string;
  statsCollectionName?: string;
};

function makeCreateStatsMaterializedView({
  client,
  databaseName,
  messagesCollectionName = "scrubbed_messages",
  statsCollectionName = "scrubbed_messages_stats",
}: MakeCreateStatsMaterializedViewParams) {
  return async function createStatsMaterializedView<T>({
    granularity,
    groupId,
    dateParts,
    addFields = {},
    since,
  }: {
    granularity: string;
    groupId: Document;
    dateParts: Document;
    addFields: Document;
    since?: Date;
  }) {
    if (granularity.length === 0) {
      throw new Error(`Granularity must be a non-empty string`);
    }
    try {
      await ensureCollectionWithIndex({
        client,
        databaseName,
        collectionName: statsCollectionName,
        indexes: [
          {
            spec: {
              granularity: 1,
              date: 1,
            },
            options: {
              unique: true,
            },
          },
          {
            spec: {
              date: 1,
              granularity: 1,
            },
            options: {
              unique: true,
            },
          },
        ],
      });
      return await client
        .db(databaseName)
        .collection(messagesCollectionName)
        .aggregate<ScrubbedMessageStats<T>>([
          {
            $match: {
              createdAt: since ? { $gte: since } : { $exists: true },
            },
          },
          {
            $group: {
              _id: groupId,
              numUserMessages: {
                $sum: {
                  $cond: {
                    if: { $eq: ["$role", "user"] },
                    then: 1,
                    else: 0,
                  },
                },
              },
              numAssistantMessages: {
                $sum: {
                  $cond: {
                    if: { $eq: ["$role", "assistant"] },
                    then: 1,
                    else: 0,
                  },
                },
              },
              // Add conversationId to set if the message is not a system message
              numConversationsIncludingEmpty: {
                $addToSet: "$conversationId",
              },
              numConversations: {
                $addToSet: {
                  $cond: {
                    if: { $ne: ["$role", "system"] },
                    then: "$conversationId",
                    else: null,
                  },
                },
              },
            },
          },
          {
            $addFields: {
              numConversations: { $size: "$numConversations" },
              numConversationsIncludingEmpty: {
                $size: "$numConversationsIncludingEmpty",
              },
              granularity,
              date: {
                $dateFromParts: dateParts,
              },
            },
          },
          {
            $addFields: {
              numEmptyConversations: {
                $subtract: [
                  "$numConversationsIncludingEmpty",
                  "$numConversations",
                ],
              },
            },
          },
          {
            $addFields: {
              ...addFields,
            },
          },
          {
            $project: {
              _id: 0,
            },
          },
          {
            $addFields: {
              _id: {
                date: "$date",
                granularity: "$granularity",
              },
            },
          },
          {
            $sort: {
              date: -1,
            },
          },
          {
            $merge: {
              into: {
                db: databaseName,
                coll: statsCollectionName,
              },
              on: ["_id"],
              whenMatched: "replace",
              whenNotMatched: "insert",
            },
          },
        ])
        .toArray();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
}

export type CreateScrubbedMessageStatsViewsArgs = {
  /**
   The granularity of stats to create. Defaults to all available granularities.
   */
  granularity?:
    | ScrubbedMessageStatsGranularity
    | ScrubbedMessageStatsGranularity[];

  /**
   The date to start aggregating stats from. Defaults to the start of the current month.
   */
  since?: Date;

  /**
   Optional MongoDB connection string. If not provided, the MONGODB_CONNECTION_URI environment variable will be used.
   */
  mongodbConnection?: string;

  /**
   Optional name for the stats database.
   */
  statsDatabaseName?: string;

  /**
   Optional name for the stats collection.
   */
  statsCollectionName?: string;
};

export async function createScrubbedMessageStatsViews({
  granularity = ["daily", "weekly", "monthly"],
  since,
  mongodbConnection,
  statsDatabaseName,
  statsCollectionName = "scrubbed_messages_stats",
}: CreateScrubbedMessageStatsViewsArgs = {}): Promise<void> {
  const { MONGODB_DATABASE_NAME, MONGODB_CONNECTION_URI } = assertEnvVars({
    MONGODB_DATABASE_NAME: "",
    MONGODB_CONNECTION_URI: "",
  });
  if (typeof granularity === "string") {
    granularity = [granularity];
  }
  if (granularity.length === 0) {
    throw new Error(
      `No granularity was specified. Either omit the argument or specify at least one granularity.`
    );
  }
  console.log(
    `Materializing stats for scrubbed messages since ${
      since ?? "the start of time"
    } at the folowing granularities: ${granularity.join(", ")}`
  );
  const client = await MongoClient.connect(
    mongodbConnection ?? MONGODB_CONNECTION_URI
  );
  try {
    const createStatsMaterializedView = makeCreateStatsMaterializedView({
      client,
      databaseName: statsDatabaseName ?? MONGODB_DATABASE_NAME,
      statsCollectionName,
    });

    if (granularity.includes("daily")) {
      const dailyStart = Date.now();
      console.log("Creating daily stats view");
      await createStatsMaterializedView<{
        year: number;
        dayOfYear: number;
        month: number;
        dayOfMonth: number;
        week: number;
        dayOfWeek: number;
      }>({
        granularity: "daily",
        since,
        groupId: {
          year: {
            $isoWeekYear: "$createdAt",
          },
          day: {
            $dayOfYear: "$createdAt",
          },
        },
        dateParts: {
          year: "$_id.year",
          day: "$_id.day",
        },
        addFields: {
          year: "$_id.year",
          dayOfYear: "$_id.day",
          month: {
            $month: "$date",
          },
          dayOfMonth: {
            $dayOfMonth: "$date",
          },
          week: {
            $week: "$date",
          },
          dayOfWeek: {
            $dayOfWeek: "$date",
          },
        },
      });
      console.log(`  view materialized in ${Date.now() - dailyStart}ms`);
    }

    if (granularity.includes("weekly")) {
      const weeklyStart = Date.now();
      console.log("Creating weekly stats view");
      await createStatsMaterializedView<{
        year: number;
        week: number;
      }>({
        granularity: "weekly",
        since,
        groupId: {
          isoWeekYear: {
            $isoWeekYear: "$createdAt",
          },
          isoWeek: {
            $isoWeek: "$createdAt",
          },
        },
        dateParts: {
          isoWeekYear: "$_id.isoWeekYear",
          isoWeek: "$_id.isoWeek",
          isoDayOfWeek: 1,
        },
        addFields: {
          year: "$_id.isoWeekYear",
          week: "$_id.isoWeek",
        },
      });
      console.log(`  view materialized in ${Date.now() - weeklyStart}ms`);
    }

    if (granularity.includes("monthly")) {
      const monthlyStart = Date.now();
      console.log("Creating monthly stats view");
      await createStatsMaterializedView<{
        year: number;
        month: number;
      }>({
        granularity: "monthly",
        since,
        groupId: {
          year: {
            $isoWeekYear: "$createdAt",
          },
          month: {
            $month: "$createdAt",
          },
        },
        dateParts: {
          year: "$_id.year",
          month: "$_id.month",
        },
        addFields: {
          year: "$_id.year",
          month: "$_id.month",
        },
      });
      console.log(`  view materialized in ${Date.now() - monthlyStart}ms`);
    }
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}
