import "dotenv/config";
import { assertEnvVars, MongoClient, Db, Document } from "mongodb-rag-core";

type ScrubbedMessageStats<T> = T &
  Document & {
    numMessages: number;
    numConversations: number;
  };

interface MakeCreateStatsViewsParams {
  db: Db;
  baseViewName: string;
}

function makeCreateStatsView({
  db,
  baseViewName = "scrubbed_messages_stats",
}: MakeCreateStatsViewsParams) {
  return async function createStatsView<
    T extends ScrubbedMessageStats<unknown>
  >(suffix: string, pipeline: Document[]) {
    if (suffix.length === 0) {
      throw new Error(`Suffix must be a non-empty string`);
    }
    const viewName = `${baseViewName}_${suffix}`;
    try {
      if (await db.listCollections({ name: viewName }).hasNext()) {
        await db.dropCollection(viewName);
      }
      return await db.createCollection<T>(viewName, {
        viewOn: "scrubbed_messages",
        pipeline,
      });
    } catch (error) {
      throw new Error(`Error creating view ${viewName}: ${error}`);
    }
  };
}

async function createScrubbedMessageStatsViews() {
  const { MONGODB_DATABASE_NAME, MONGODB_CONNECTION_URI } = assertEnvVars({
    MONGODB_DATABASE_NAME: "",
    MONGODB_CONNECTION_URI: "",
  });
  const client = await MongoClient.connect(MONGODB_CONNECTION_URI);
  try {
    const db = client.db(MONGODB_DATABASE_NAME);
    const createStatsView = makeCreateStatsView({
      db,
      baseViewName: "scrubbed_messages_stats",
    });
    await createStatsView<
      ScrubbedMessageStats<{
        date: Date;
        year: number;
        dayOfYear: number;
        month: number;
        dayOfMonth: number;
        week: number;
        dayOfWeek: number;
      }>
    >("daily", [
      {
        $match: {
          role: "user",
        },
      },
      {
        $group: {
          _id: {
            dayOfYear: {
              $dayOfYear: "$createdAt",
            },
            isoYear: {
              $isoWeekYear: "$createdAt",
            },
          },
          numMessages: {
            $sum: 1,
          },
          conversations: {
            $addToSet: "$conversationId",
          },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.isoYear",
          dayOfYear: "$_id.dayOfYear",
          date: {
            $dateFromParts: {
              year: "$_id.isoYear",
              day: "$_id.dayOfYear",
            },
          },
          numMessages: 1,
          numConversations: {
            $size: "$conversations",
          },
        },
      },
      {
        $addFields: {
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
      },
      {
        $sort: {
          date: -1,
        },
      },
    ]);

    await createStatsView<
      ScrubbedMessageStats<{
        date: Date;
        year: number;
        week: number;
      }>
    >("weekly", [
      {
        $match: {
          role: "user",
        },
      },
      {
        $group: {
          _id: {
            month: {
              $month: "$createdAt",
            },
            isoYear: {
              $isoWeekYear: "$createdAt",
            },
          },
          numMessages: {
            $sum: 1,
          },
          conversations: {
            $addToSet: "$conversationId",
          },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.isoYear",
          month: "$_id.month",
          date: {
            $dateFromParts: {
              year: "$_id.isoYear",
              month: "$_id.month",
            },
          },
          numMessages: 1,
          numConversations: {
            $size: "$conversations",
          },
        },
      },
      {
        $sort: {
          date: -1,
        },
      },
    ]);

    await createStatsView<
      ScrubbedMessageStats<{
        date: Date;
        year: number;
        month: number;
      }>
    >("monthly", [
      {
        $match: {
          role: "user",
        },
      },
      {
        $group: {
          _id: {
            month: {
              $month: "$createdAt",
            },
            isoYear: {
              $isoWeekYear: "$createdAt",
            },
          },
          numMessages: {
            $sum: 1,
          },
          conversations: {
            $addToSet: "$conversationId",
          },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.isoYear",
          month: "$_id.month",
          date: {
            $dateFromParts: {
              year: "$_id.isoYear",
              month: "$_id.month",
            },
          },
          numMessages: 1,
          numConversations: {
            $size: "$conversations",
          },
        },
      },
      {
        $sort: {
          date: -1,
        },
      },
    ]);
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}

createScrubbedMessageStatsViews();
