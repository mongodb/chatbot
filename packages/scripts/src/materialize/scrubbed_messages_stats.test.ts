import { BSON, MongoClient, ObjectId } from "mongodb-rag-core/mongodb";
import { promises as fs } from "fs";
import { createScrubbedMessageStatsViews } from "./scrubbed_messages_stats";
import path from "path";
import { assertEnvVars } from "mongodb-rag-core";

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
    // Seed the database with test data
    try {
      const seedDataFilePath = path.join(
        __dirname,
        "testData/scrubbed_messages.json"
      );
      const rawSeedData = await fs.readFile(seedDataFilePath, "utf8");
      const seedData = BSON.EJSON.parse(rawSeedData);
      await client.connect();
      await client
        .db(databaseName)
        .collection(scrubbedMessagesCollectionName)
        .insertMany(seedData);
    } finally {
      await client.close();
    }
  }, 20000);

  afterEach(async () => {
    // Drop the stats collection between tests
    try {
      await client.connect();
      await client
        .db(databaseName)
        .dropCollection(scrubbedMessagesStatsCollectionName);
    } finally {
      await client.close();
    }
  });

  afterAll(async () => {
    // Drop the test database after all tests
    try {
      await client.connect();
      await client.db(databaseName).dropDatabase();
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
          numAssistantMessages: 75,
          numUserMessages: 75,
          numConversations: 39,
          numConversationsIncludingEmpty: 54,
          numEmptyConversations: 15,
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
          numAssistantMessages: 86,
          numUserMessages: 86,
          numConversations: 28,
          numConversationsIncludingEmpty: 32,
          numEmptyConversations: 4,
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
          numUserMessages: 73,
          numAssistantMessages: 73,
          numConversations: 46,
          numConversationsIncludingEmpty: 60,
          numEmptyConversations: 14,
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
          numAssistantMessages: 161,
          numUserMessages: 161,
          numConversations: 66,
          numConversationsIncludingEmpty: 86,
          numEmptyConversations: 20,
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
          numAssistantMessages: 73,
          numUserMessages: 73,
          numConversations: 46,
          numConversationsIncludingEmpty: 60,
          numEmptyConversations: 14,
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
          numAssistantMessages: 234,
          numUserMessages: 234,
          numConversations: 111,
          numConversationsIncludingEmpty: 146,
          numEmptyConversations: 35,
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
          numAssistantMessages: 234,
          numUserMessages: 234,
          numConversations: 111,
          numConversationsIncludingEmpty: 146,
          numEmptyConversations: 35,
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
          numAssistantMessages: 86,
          numUserMessages: 86,
          numConversations: 28,
          numConversationsIncludingEmpty: 32,
          numEmptyConversations: 4,
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
          numAssistantMessages: 73,
          numUserMessages: 73,
          numConversations: 46,
          numConversationsIncludingEmpty: 60,
          numEmptyConversations: 14,
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
          numAssistantMessages: 86,
          numUserMessages: 86,
          numConversations: 28,
          numConversationsIncludingEmpty: 32,
          numEmptyConversations: 4,
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
          numAssistantMessages: 73,
          numUserMessages: 73,
          numConversations: 46,
          numConversationsIncludingEmpty: 60,
          numEmptyConversations: 14,
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
          numUserMessages: 159,
          numAssistantMessages: 159,
          numConversations: 73,
          numConversationsIncludingEmpty: 92,
          numEmptyConversations: 19,
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
