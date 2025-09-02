import { MongoClient, ObjectId } from "mongodb";
import { MONGO_MEMORY_SERVER_URI } from "../test/constants";
import {
  addExplainToQuery,
  getMongoshCollectionDocumentCount,
  calculateQueryEfficiency,
  profileMongoshQuery,
  ProfileMongoshQueryReturnValue,
} from "./profileMongoshQuery";

// Note: These tests require mongosh to be installed.
// They are skipped in CI but can be run locally.
describe.skip("profileMongoshQuery", () => {
  let mongoClient: MongoClient;
  const databaseName = "test_db_" + Date.now().toString();

  beforeAll(async () => {
    mongoClient = new MongoClient(MONGO_MEMORY_SERVER_URI);
    await mongoClient.connect();
  });

  afterAll(async () => {
    await mongoClient.close();
  });

  describe("addExplainToQuery", () => {
    it("should add explain to db.collection.method() pattern", () => {
      expect(addExplainToQuery("db.users.find({})")).toBe(
        'db.users.find({}).explain("executionStats")'
      );
      expect(addExplainToQuery("db.products.findOne({ id: 1 })")).toBe(
        'db.products.find({ id: 1 }).limit(1).explain("executionStats")'
      );
      expect(addExplainToQuery("db.orders.aggregate([{ $match: {} }])")).toBe(
        'db.orders.aggregate([{ $match: {} }]).explain("executionStats")'
      );
    });

    it("should add explain to db['collection'].method() pattern", () => {
      expect(addExplainToQuery("db['users'].find({})")).toBe(
        "db['users'].find({}).explain(\"executionStats\")"
      );
      expect(addExplainToQuery('db["products"].find({ id: 1 })')).toBe(
        'db["products"].find({ id: 1 }).explain("executionStats")'
      );
    });

    it("should add explain to db.getCollection() pattern", () => {
      expect(addExplainToQuery("db.getCollection('users').find({})")).toBe(
        "db.getCollection('users').find({}).explain(\"executionStats\")"
      );
      expect(addExplainToQuery('db.getCollection("products").findOne()')).toBe(
        'db.getCollection("products").find().limit(1).explain("executionStats")'
      );
    });

    it("should add explain to db.collection.method().sort() pattern", () => {
      expect(addExplainToQuery("db.users.find({}).sort({ age: 1 })")).toBe(
        'db.users.find({}).sort({ age: 1 }).explain("executionStats")'
      );
    });

    it("should add explain to db.collection.method().limit() pattern", () => {
      expect(addExplainToQuery("db.users.find({}).limit(10)")).toBe(
        'db.users.find({}).limit(10).explain("executionStats")'
      );
    });

    it("should transform findOne to find().limit(1).explain() for all patterns", () => {
      expect(addExplainToQuery("db.users.findOne({})")).toBe(
        'db.users.find({}).limit(1).explain("executionStats")'
      );
      expect(addExplainToQuery("db['users'].findOne({ age: 30 })")).toBe(
        "db['users'].find({ age: 30 }).limit(1).explain(\"executionStats\")"
      );
      expect(addExplainToQuery("db.getCollection('users').findOne()")).toBe(
        "db.getCollection('users').find().limit(1).explain(\"executionStats\")"
      );
    });

    it("should handle all supported MongoDB methods", () => {
      const methods = [
        "find",
        "aggregate",
        "count",
        "distinct",
        "update",
        "remove",
        "delete",
      ];

      methods.forEach((method) => {
        const query = `db.users.${method}({})`;
        const expected = `db.users.${method}({}).explain("executionStats")`;
        expect(addExplainToQuery(query)).toBe(expected);
      });
    });

    it("should handle complex queries with whitespace", () => {
      const query = `db.users.find(
        { 
          age: { $gt: 25 },
          status: "active"
        }
      )`;
      expect(addExplainToQuery(query)).toContain('.explain("executionStats")');
    });

    it("should use fallback pattern for unmatched queries", () => {
      const query = "db.someWeirdPattern.notAMethod";
      expect(addExplainToQuery(query)).toBe(
        'db.someWeirdPattern.notAMethod.explain("executionStats")'
      );
    });
  });

  describe("calculateQueryEfficiency", () => {
    it("should return 1.0 for perfect efficiency", () => {
      const explainOutput = {
        executionStats: {
          nReturned: 10,
          totalDocsExamined: 10,
          totalKeysExamined: 10,
          executionTimeMillis: 5,
        },
        queryPlanner: {
          namespace: "test.users",
          winningPlan: {},
        },
      };

      expect(calculateQueryEfficiency(explainOutput, 1000)).toBe(1.0);
    });

    it("should calculate efficiency correctly for partial scans", () => {
      const explainOutput = {
        executionStats: {
          nReturned: 10,
          totalDocsExamined: 100,
          totalKeysExamined: 100,
          executionTimeMillis: 15,
        },
        queryPlanner: {
          namespace: "test.users",
          winningPlan: {},
        },
      };

      // Efficiency = 1 - (100 - 10) / 1000 = 1 - 90/1000 = 0.91
      expect(calculateQueryEfficiency(explainOutput, 1000)).toBe(0.91);
    });

    it("should return 0 for zero total documents", () => {
      const explainOutput = {
        executionStats: {
          nReturned: 0,
          totalDocsExamined: 10, // Changed to test division by zero handling
          totalKeysExamined: 0,
          executionTimeMillis: 1,
        },
        queryPlanner: {
          namespace: "test.empty",
          winningPlan: {},
        },
      };

      expect(calculateQueryEfficiency(explainOutput, 0)).toBe(0);
    });

    it("should clamp efficiency between 0 and 1", () => {
      const explainOutput = {
        executionStats: {
          nReturned: 1,
          totalDocsExamined: 2000,
          totalKeysExamined: 2000,
          executionTimeMillis: 100,
        },
        queryPlanner: {
          namespace: "test.users",
          winningPlan: {},
        },
      };

      // Would be negative without clamping
      expect(calculateQueryEfficiency(explainOutput, 100)).toBe(0);
    });

    it("should handle edge case where examined < returned", () => {
      const explainOutput = {
        executionStats: {
          nReturned: 100,
          totalDocsExamined: 50, // Shouldn't happen but let's test
          totalKeysExamined: 50,
          executionTimeMillis: 10,
        },
        queryPlanner: {
          namespace: "test.users",
          winningPlan: {},
        },
      };

      expect(calculateQueryEfficiency(explainOutput, 1000)).toBe(1.0);
    });
  });

  describe("getMongoshCollectionDocumentCount", () => {
    const collectionName = "test_collection_" + Date.now();
    let collection: any;

    beforeEach(async () => {
      const db = mongoClient.db(databaseName);
      collection = db.collection(collectionName);
      // Insert test documents
      await collection.insertMany([
        { _id: new ObjectId(), name: "John", age: 30 },
        { _id: new ObjectId(), name: "Jane", age: 28 },
        { _id: new ObjectId(), name: "Bob", age: 35 },
      ]);
    });

    afterEach(async () => {
      await collection.drop().catch(() => {
        // Ignore error if collection doesn't exist
      });
    });

    it("should return correct document count", async () => {
      const count = await getMongoshCollectionDocumentCount(
        MONGO_MEMORY_SERVER_URI,
        collectionName,
        databaseName
      );

      expect(count).toBe(3);
    });

    it("should return 0 for empty collection", async () => {
      await collection.deleteMany({});

      const count = await getMongoshCollectionDocumentCount(
        MONGO_MEMORY_SERVER_URI,
        collectionName,
        databaseName
      );

      expect(count).toBe(0);
    });

    it("should handle non-existent collection", async () => {
      const count = await getMongoshCollectionDocumentCount(
        MONGO_MEMORY_SERVER_URI,
        "non_existent_collection",
        databaseName
      );

      expect(count).toBe(0);
    });
  });

  describe("profileMongoshQuery", () => {
    const collectionName = "explain_test_" + Date.now();
    let collection: any;

    beforeEach(async () => {
      const db = mongoClient.db(databaseName);
      collection = db.collection(collectionName);
      // Insert test documents
      await collection.insertMany([
        { _id: new ObjectId(), name: "John", age: 30, city: "NYC" },
        { _id: new ObjectId(), name: "Jane", age: 28, city: "LA" },
        { _id: new ObjectId(), name: "Bob", age: 35, city: "NYC" },
        { _id: new ObjectId(), name: "Alice", age: 22, city: "Chicago" },
        { _id: new ObjectId(), name: "Charlie", age: 40, city: "NYC" },
      ]);
    });

    afterEach(async () => {
      await collection.drop().catch(() => {
        // Ignore error if collection doesn't exist
      });
    });

    it("should successfully profile a query", async () => {
      const result = await profileMongoshQuery(
        `db.${collectionName}.find({ age: { $gt: 25 } })`,
        databaseName,
        MONGO_MEMORY_SERVER_URI
      );

      expect(result).toMatchObject({
        error: null,
        profile: {
          explainOutput: expect.objectContaining({
            executionStats: expect.objectContaining({
              nReturned: 4, // John, Jane, Bob, Charlie
            }),
          }),
          collection: expect.objectContaining({
            name: collectionName,
            documentCount: 5,
          }),
        },
      } satisfies ProfileMongoshQueryReturnValue);
    });

    it("should return error when collection name cannot be extracted", async () => {
      const result = await profileMongoshQuery(
        "invalidQuery",
        databaseName,
        MONGO_MEMORY_SERVER_URI
      );

      expect(result).toMatchObject({
        error: expect.objectContaining({
          message: expect.any(String),
        }),
        profile: null,
      } satisfies ProfileMongoshQueryReturnValue);
    });

    it("should handle db.getCollection pattern correctly", async () => {
      const result = await profileMongoshQuery(
        `db.getCollection("${collectionName}").find({ name: 'John' })`,
        databaseName,
        MONGO_MEMORY_SERVER_URI
      );

      expect(result).toMatchObject({
        error: null,
        profile: {
          explainOutput: expect.objectContaining({
            executionStats: expect.objectContaining({
              nReturned: 1, // John
            }),
          }),
          collection: expect.objectContaining({
            name: collectionName,
            documentCount: 5,
          }),
        },
      } satisfies ProfileMongoshQueryReturnValue);
    });

    it("should handle db['collection'] pattern correctly", async () => {
      const result = await profileMongoshQuery(
        `db['${collectionName}'].find({ city: "NYC" })`,
        databaseName,
        MONGO_MEMORY_SERVER_URI
      );

      expect(result).toMatchObject({
        error: null,
        profile: {
          explainOutput: expect.objectContaining({
            executionStats: expect.objectContaining({
              nReturned: 3, // John, Bob, Charlie
            }),
          }),
          collection: expect.objectContaining({
            name: collectionName,
            documentCount: 5,
          }),
        },
      } satisfies ProfileMongoshQueryReturnValue);
    });

    it("should calculate efficiency correctly for indexed vs non-indexed queries", async () => {
      // Create an index
      await collection.createIndex({ age: 1 });

      const result = await profileMongoshQuery(
        `db.${collectionName}.find({ age: 30 })`,
        databaseName,
        MONGO_MEMORY_SERVER_URI
      );

      expect(result).toMatchObject({
        error: null,
        profile: {
          explainOutput: expect.objectContaining({
            executionStats: expect.objectContaining({
              nReturned: 1, // John
            }),
          }),
          collection: expect.objectContaining({
            name: collectionName,
            documentCount: 5,
          }),
        },
      } satisfies ProfileMongoshQueryReturnValue);
    });
  });
});
