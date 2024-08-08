import {
  assertEnvVars,
  BSON,
  Db,
  MongoClient,
  ObjectId,
} from "mongodb-rag-core";
import { promises as fs } from "fs";
import { createScrubbedMessageStatsViews } from "./scrubbed_messages_stats";
import path from "path";

async function seedTestDatabase(args: { db: Db; collectionName: string }) {
  const seedDataFilePath = path.join(
    __dirname,
    "testData/scrubbed_messages.json"
  );
  const rawSeedData = await fs.readFile(seedDataFilePath, "utf8");
  const seedData = BSON.EJSON.parse(rawSeedData);
  await args.db.collection(args.collectionName).insertMany(seedData);
}

const { MONGODB_CONNECTION_URI } = assertEnvVars({
  MONGODB_CONNECTION_URI: "",
});

const client = new MongoClient(MONGODB_CONNECTION_URI);
const testRunId = new ObjectId();
const databaseName = `scrubbed_messages_stats-test-${testRunId.toHexString()}`;
const scrubbedMessagesCollectionName = `scrubbed_messages`;
const scrubbedMessagesStatsCollectionName = `scrubbed_messages_stats`;
describe("Create a materialized view of scrubbed message stats", () => {
  beforeAll(async () => {
    try {
      await client.connect();
      const db = client.db(databaseName);
      await seedTestDatabase({
        db,
        collectionName: scrubbedMessagesCollectionName,
      });
    } finally {
      await client.close();
    }
  }, 10000);
  afterAll(async () => {
    try {
      await client.connect();
      const db = client.db(databaseName);
      await db.dropDatabase();
    } finally {
      await client.close();
    }
  });
  afterEach(async () => {
    try {
      await client.connect();
      const db = client.db(databaseName);
      await db.collection(scrubbedMessagesStatsCollectionName).drop();
    } finally {
      await client.close();
    }
  });

  test("By default, materialize daily, weekly, and monthly granularities for all time", async () => {
    // Create the materialized views
    await createScrubbedMessageStatsViews({
      mongodbConnection: MONGODB_CONNECTION_URI,
      statsDatabaseName: databaseName,
      statsCollectionName: scrubbedMessagesStatsCollectionName,
    });
    // Connect to the database
    await client.connect();
    const db = client.db(databaseName);
    const statsCollection = db.collection(scrubbedMessagesStatsCollectionName);
    // Check that the view has the correct data
    const dailyStats = await statsCollection
      .find({ granularity: "daily" })
      .toArray();
    expect(dailyStats).toEqual(
      BSON.EJSON.deserialize([
        {
          _id: {
            date: {
              $date: "2024-08-10T00:00:00.000Z",
            },
            granularity: "daily",
          },
          numMessages: 75,
          numConversations: 38,
          granularity: "daily",
          date: {
            $date: "2024-08-10T00:00:00.000Z",
          },
          year: 2024,
          dayOfYear: 223,
          month: 8,
          dayOfMonth: 10,
          week: 31,
          dayOfWeek: 7,
        },
        {
          _id: {
            date: {
              $date: "2024-08-11T00:00:00.000Z",
            },
            granularity: "daily",
          },
          numMessages: 86,
          numConversations: 27,
          granularity: "daily",
          date: {
            $date: "2024-08-11T00:00:00.000Z",
          },
          year: 2024,
          dayOfYear: 224,
          month: 8,
          dayOfMonth: 11,
          week: 32,
          dayOfWeek: 1,
        },
        {
          _id: {
            date: {
              $date: "2024-08-12T00:00:00.000Z",
            },
            granularity: "daily",
          },
          numMessages: 73,
          numConversations: 45,
          granularity: "daily",
          date: {
            $date: "2024-08-12T00:00:00.000Z",
          },
          year: 2024,
          dayOfYear: 225,
          month: 8,
          dayOfMonth: 12,
          week: 32,
          dayOfWeek: 2,
        },
      ])
    );

    const weeklyStats = await statsCollection
      .find({ granularity: "weekly" })
      .toArray();
    expect(weeklyStats).toEqual(
      BSON.EJSON.deserialize([
        {
          _id: {
            date: {
              $date: "2024-08-05T00:00:00.000Z",
            },
            granularity: "weekly",
          },
          numMessages: 161,
          numConversations: 65,
          granularity: "weekly",
          date: {
            $date: "2024-08-05T00:00:00.000Z",
          },
          year: 2024,
          week: 32,
        },
        {
          _id: {
            date: {
              $date: "2024-08-12T00:00:00.000Z",
            },
            granularity: "weekly",
          },
          numMessages: 73,
          numConversations: 45,
          granularity: "weekly",
          date: {
            $date: "2024-08-12T00:00:00.000Z",
          },
          year: 2024,
          week: 33,
        },
      ])
    );

    const monthlyStats = await statsCollection
      .find({ granularity: "monthly" })
      .toArray();
    expect(monthlyStats).toEqual(
      BSON.EJSON.deserialize([
        {
          _id: {
            date: {
              $date: "2024-08-01T00:00:00.000Z",
            },
            granularity: "monthly",
          },
          numMessages: 234,
          numConversations: 110,
          granularity: "monthly",
          date: {
            $date: "2024-08-01T00:00:00.000Z",
          },
          year: 2024,
          month: 8,
        },
      ])
    );
  }, 20000);

  test("Materialize a specific granularity", async () => {
    // Create the materialized views
    await createScrubbedMessageStatsViews({
      granularity: "monthly",
      mongodbConnection: MONGODB_CONNECTION_URI,
      statsDatabaseName: databaseName,
      statsCollectionName: scrubbedMessagesStatsCollectionName,
    });
    // Connect to the database
    await client.connect();
    const db = client.db(databaseName);
    const statsCollection = db.collection(scrubbedMessagesStatsCollectionName);
    // Check that the view has the correct data
    const dailyStats = await statsCollection
      .find({ granularity: "daily" })
      .toArray();
    expect(dailyStats).toEqual([]);

    const weeklyStats = await statsCollection
      .find({ granularity: "weekly" })
      .toArray();
    expect(weeklyStats).toEqual([]);

    const monthlyStats = await statsCollection
      .find({ granularity: "monthly" })
      .toArray();
    expect(monthlyStats).toEqual(
      BSON.EJSON.deserialize([
        {
          _id: {
            date: {
              $date: "2024-08-01T00:00:00.000Z",
            },
            granularity: "monthly",
          },
          numMessages: 234,
          numConversations: 110,
          granularity: "monthly",
          date: {
            $date: "2024-08-01T00:00:00.000Z",
          },
          year: 2024,
          month: 8,
        },
      ])
    );
  }, 20000);

  test("Materialize since a specific time", async () => {
    // Create the materialized views
    await createScrubbedMessageStatsViews({
      since: new Date("2024-08-11T00:00:00.000Z"),
      mongodbConnection: MONGODB_CONNECTION_URI,
      statsDatabaseName: databaseName,
      statsCollectionName: scrubbedMessagesStatsCollectionName,
    });
    // Connect to the database
    await client.connect();
    const db = client.db(databaseName);
    const statsCollection = db.collection(scrubbedMessagesStatsCollectionName);
    // Check that the view has the correct data
    const dailyStats = await statsCollection
      .find({ granularity: "daily" })
      .toArray();
    expect(dailyStats).toEqual(
      BSON.EJSON.deserialize([
        {
          _id: {
            date: {
              $date: "2024-08-11T00:00:00.000Z",
            },
            granularity: "daily",
          },
          numMessages: 86,
          numConversations: 27,
          granularity: "daily",
          date: {
            $date: "2024-08-11T00:00:00.000Z",
          },
          year: 2024,
          dayOfYear: 224,
          month: 8,
          dayOfMonth: 11,
          week: 32,
          dayOfWeek: 1,
        },
        {
          _id: {
            date: {
              $date: "2024-08-12T00:00:00.000Z",
            },
            granularity: "daily",
          },
          numMessages: 73,
          numConversations: 45,
          granularity: "daily",
          date: {
            $date: "2024-08-12T00:00:00.000Z",
          },
          year: 2024,
          dayOfYear: 225,
          month: 8,
          dayOfMonth: 12,
          week: 32,
          dayOfWeek: 2,
        },
      ])
    );

    const weeklyStats = await statsCollection
      .find({ granularity: "weekly" })
      .toArray();
    expect(weeklyStats).toEqual(
      BSON.EJSON.deserialize([
        {
          _id: {
            date: {
              $date: "2024-08-05T00:00:00.000Z",
            },
            granularity: "weekly",
          },
          numMessages: 86,
          numConversations: 27,
          granularity: "weekly",
          date: {
            $date: "2024-08-05T00:00:00.000Z",
          },
          year: 2024,
          week: 32,
        },
        {
          _id: {
            date: {
              $date: "2024-08-12T00:00:00.000Z",
            },
            granularity: "weekly",
          },
          numMessages: 73,
          numConversations: 45,
          granularity: "weekly",
          date: {
            $date: "2024-08-12T00:00:00.000Z",
          },
          year: 2024,
          week: 33,
        },
      ])
    );

    const monthlyStats = await statsCollection
      .find({ granularity: "monthly" })
      .toArray();
    expect(monthlyStats).toEqual(
      BSON.EJSON.deserialize([
        {
          _id: {
            date: {
              $date: "2024-08-01T00:00:00.000Z",
            },
            granularity: "monthly",
          },
          numMessages: 159,
          numConversations: 72,
          granularity: "monthly",
          date: {
            $date: "2024-08-01T00:00:00.000Z",
          },
          year: 2024,
          month: 8,
        },
      ])
    );
  });
});
