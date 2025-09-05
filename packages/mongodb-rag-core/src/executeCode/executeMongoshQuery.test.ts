import { jest } from "@jest/globals";
import { MongoClient, ObjectId } from "mongodb";
import { MONGO_MEMORY_SERVER_URI } from "../test/constants";
import { makeExecuteMongoshQuery } from "./executeMongoshQuery";

jest.setTimeout(1000 * 60);

// Note: skipping tests for CI b/c requires mongosh dependency.
// Which we don't otherwise need. As this function is only used
// in local env, it's ok to not validate in CI.
describe.skip("executeMqlQuery", () => {
  const mongoClient = new MongoClient(MONGO_MEMORY_SERVER_URI);
  const databaseName = "test_db_" + Date.now().toString();
  const collectionName = "users";
  const collection = mongoClient.db(databaseName).collection(collectionName);
  const users = [
    { _id: new ObjectId(), name: "John", age: 30 },
    { _id: new ObjectId(), name: "Jane", age: 28 },
  ];

  beforeAll(async () => {
    await mongoClient.connect();
  });
  afterAll(async () => {
    await mongoClient.close();
  });
  beforeEach(async () => {
    await collection.insertMany(users);
  });
  afterEach(async () => {
    await collection.drop();
  });

  const executeMongoshQuery = makeExecuteMongoshQuery({
    uri: MONGO_MEMORY_SERVER_URI,
    execOptions: {},
  });
  it("should execute a mongosh .find() query and return results", async () => {
    // Execute the function
    const res = await executeMongoshQuery({
      query: "db.users.find({ age: { $gt: 25 } })",
      databaseName: databaseName,
    });

    // Verify the result
    expect(res.result).toEqual(users);
    expect(res.executionTimeMs).toBeGreaterThanOrEqual(0);
    expect(res.error).toBeUndefined();
  });

  it("should execute a mongosh .aggregate() query and return results", async () => {
    // Execute the function with a simple aggregation pipeline

    const res = await executeMongoshQuery({
      query: "db.users.aggregate([{ $match: { age: { $gt: 25 } } }])",
      databaseName: databaseName,
    });

    // Verify the result
    expect(res.result).toBeTruthy();
    expect(Array.isArray(res.result)).toBe(true);
    expect((res.result as any[]).length).toBe(2);
    expect(res.executionTimeMs).toBeGreaterThanOrEqual(0);
    expect(res.error).toBeUndefined();
  });

  it("should execute a mongosh .countDocuments() query and return results", async () => {
    // Execute the function with a count query
    const res = await executeMongoshQuery({
      query: "db.users.countDocuments({ age: { $gt: 25 } })",
      databaseName: databaseName,
    });

    // Verify the result
    expect(res.result).toBe(2);
    expect(res.executionTimeMs).toBeGreaterThanOrEqual(0);
    expect(res.error).toBeUndefined();
  });
  it("should escape single quotes", async () => {
    const singleQuoteInQuery = "db.users.find({ name: 'John' })";
    const res = await executeMongoshQuery({
      query: singleQuoteInQuery,
      databaseName: databaseName,
    });

    expect(
      (res.result as { name: string }[]).find((u) => u.name === "John")
    ).toBeTruthy();
    expect(res.executionTimeMs).toBeGreaterThanOrEqual(0);
    expect(res.error).toBeUndefined();
  });

  it("should not postfix .toArray() if already present", async () => {
    // Test the appendToArrayIfNeeded function directly
    const queryWithToArray = "db.users.find().toArray()";
    const res = await executeMongoshQuery({
      query: queryWithToArray,

      databaseName: databaseName,
    });

    expect(res.result).toEqual(users);
    expect(res.executionTimeMs).toBeGreaterThanOrEqual(0);
    expect(res.error).toBeUndefined();
  });
  it("should not postfix .toArray() if .explain() query", async () => {
    // Execute an explain query
    const res = await executeMongoshQuery({
      query: `db.${collectionName}.find({ age: { $gt: 25 } }).explain('executionStats')`,
      databaseName,
    });

    // Verify the result is an explain output object, not an array
    expect(res.result).toBeTruthy();
    expect(Array.isArray(res.result)).toBe(false);
    expect(res.result).toHaveProperty("queryPlanner");
    expect(res.result).toHaveProperty("executionStats");
    expect(res.executionTimeMs).toBeGreaterThanOrEqual(0);
    expect(res.error).toBeUndefined();
  });

  it("should handle semicolon at end of statement", async () => {
    // Execute the function with a query that has a semicolon
    const res = await executeMongoshQuery({
      query: "db.users.findOne({ age: 30 });",
      databaseName: databaseName,
    });

    // Verify the result
    expect(res.result).toBeTruthy();
    expect((res.result as { name: string }).name).toBe("John");
    expect(res.executionTimeMs).toBeGreaterThanOrEqual(0);
    expect(res.error).toBeUndefined();
  });

  it("should handle errors from mongosh execution", async () => {
    // Execute the function with an invalid query
    const res = await executeMongoshQuery({
      query: "db.nonexistentCollection.notAMongoMethod()",
      databaseName: "nonexistent_db",
    });

    // Verify the error is captured
    expect(res.result).toBeNull();
    expect(res.executionTimeMs).toBeNull();
    expect(res.error).toBeDefined();
  });

  it("should handle parsing errors from mongosh output", async () => {
    // Execute the function with a query that returns a non-JSON result
    const res = await executeMongoshQuery({
      query: "print('Line 1'); print('Line 2')",
      databaseName: databaseName,
    });

    // Verify the parsing error is captured
    expect(res.result).toBeNull();
    expect(res.executionTimeMs).toBeNull();
    expect(res.error).toBeDefined();
  });

  it("should handle stderr output from mongosh", async () => {
    // Execute the function with a query that produces stderr output
    const res = await executeMongoshQuery({
      query: "console.error('Error message'); db.users.findOne();",
      databaseName: databaseName,
    });

    expect(res.executionTimeMs).toBeNull();
    expect(res.result).toBeNull();
    expect(res.error).toBeDefined();
  });
});
