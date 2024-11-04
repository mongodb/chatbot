import "dotenv/config";
import { assertEnvVars } from "mongodb-rag-core";
import { MongoClient, ObjectId } from "mongodb-rag-core/mongodb";
import {
  ensureCollectionWithIndex,
  ensureIndex,
  startOfMonth,
  startOfWeek,
  startOfDay,
} from "./materializedViewUtils";

const { MONGODB_CONNECTION_URI } = assertEnvVars({
  MONGODB_CONNECTION_URI: "",
});

const client = new MongoClient(MONGODB_CONNECTION_URI);
const testRunId = new ObjectId();
const databaseName = `materialized-view-utils-test-${testRunId.toHexString()}`;
const collectionName = "my-test-collection";
describe("MongoDB DDL utils", () => {
  afterEach(async () => {
    try {
      await client.connect();
      const db = client.db(databaseName);
      await db.dropDatabase();
    } finally {
      await client.close();
    }
  });

  describe("ensureIndex", () => {
    it("creates an index if there isn't an existing one that matches the definition", async () => {
      await client.connect();
      const db = client.db(databaseName);
      await db.createCollection(collectionName);
      const collection = db.collection(collectionName);
      await ensureIndex({
        client,
        databaseName,
        collectionName,
        index: { foo: 1 },
        options: { unique: true },
      });
      const indexes = await collection.listIndexes().toArray();
      expect(indexes).toHaveLength(2); // Default _id index + foo index
    });

    it("is a no-op if an existing index matches the definition", async () => {
      await client.connect();
      const db = client.db(databaseName);
      await db.createCollection(collectionName);
      const collection = db.collection(collectionName);
      await ensureIndex({
        client,
        databaseName,
        collectionName,
        index: { foo: 1 },
        options: { unique: true },
      });
      await ensureIndex({
        client,
        databaseName,
        collectionName,
        index: { foo: 1 },
        options: { unique: true },
      });
      const indexes = await collection.listIndexes().toArray();
      expect(indexes).toHaveLength(2); // Default _id index + foo index
    });
  });

  describe("ensureCollectionWithIndex", () => {
    it("creates a collection and a set of indexes if either/both doesn't already exist", async () => {
      await ensureCollectionWithIndex({
        client,
        databaseName,
        collectionName,
        index: {
          spec: { foo: 1 },
          options: { unique: true },
        },
      });
      await client.connect();
      const db = client.db(databaseName);
      const collection = db.collection(collectionName);
      const indexes = await collection.listIndexes().toArray();
      expect(indexes).toHaveLength(2); // Default _id index + foo index
    });

    it("allows you to ensure multiple indexes in a single command", async () => {
      await ensureCollectionWithIndex({
        client,
        databaseName,
        collectionName,
        indexes: [
          {
            spec: { foo: 1 },
            options: { unique: true },
          },
          {
            spec: { bar: 1 },
            options: { unique: true },
          },
        ],
      });
      await client.connect();
      const db = client.db(databaseName);
      const collection = db.collection(collectionName);
      const indexes = await collection.listIndexes().toArray();
      expect(indexes).toHaveLength(3); // Default _id index + foo index + bar index
    });
  });
});

describe("Date utils", () => {
  describe("startOfMonth", () => {
    it("returns the first day of the month", () => {
      const date = new Date("2021-01-15T00:00:00Z");
      expect(startOfMonth(date)).toEqual(new Date("2021-01-01T00:00:00Z"));
    });
  });

  describe("startOfWeek", () => {
    it("returns the first day of the week", () => {
      const date = new Date("2021-01-15T00:00:00Z");
      expect(startOfWeek(date)).toEqual(new Date("2021-01-10T00:00:00Z"));
    });

    it("allows you choose if the week starts on Sunday or Monday", () => {
      const date = new Date("2021-01-15T00:00:00Z");
      expect(startOfWeek(date, "sunday")).toEqual(
        new Date("2021-01-10T00:00:00Z")
      );
      expect(startOfWeek(date, "monday")).toEqual(
        new Date("2021-01-11T00:00:00Z")
      );
    });
  });

  describe("startOfDay", () => {
    it("returns the start of the day", () => {
      const date = new Date("2021-01-15T12:34:56Z");
      expect(startOfDay(date)).toEqual(new Date("2021-01-15T00:00:00Z"));
    });
  });
});
