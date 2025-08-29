import { jest } from "@jest/globals";
import { MongoClient, ObjectId } from "mongodb";
import { MONGO_MEMORY_SERVER_URI } from "../test/constants";
import { makeExecuteEjsonAggregationQuery } from "./executeEjsonAggregation";

jest.setTimeout(1000 * 60);

describe("executeEjsonAggregationQuery", () => {
  const mongoClient = new MongoClient(MONGO_MEMORY_SERVER_URI);
  const databaseName = "test_db_" + Date.now().toString();
  const collectionName = "users";
  const collection = mongoClient.db(databaseName).collection(collectionName);

  const users = [
    {
      _id: new ObjectId(),
      name: "John",
      age: 30,
      createdAt: new Date("2023-01-01"),
    },
    {
      _id: new ObjectId(),
      name: "Jane",
      age: 28,
      createdAt: new Date("2023-02-01"),
    },
    {
      _id: new ObjectId(),
      name: "Bob",
      age: 35,
      createdAt: new Date("2023-03-01"),
    },
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

  const executeEjsonAggregation = makeExecuteEjsonAggregationQuery({
    mongoClient,
  });

  it("should execute aggregation query with regular JSON (no ejson formatting needed)", async () => {
    // Test case 1: basic aggregation pipeline that doesn't need EJSON formatting
    const pipeline = JSON.stringify([
      { $match: { age: { $gt: 25 } } },
      { $project: { name: 1, age: 1 } },
      { $sort: { age: 1 } },
    ]);

    const result = await executeEjsonAggregation({
      query: pipeline,
      databaseName,
      collectionName,
    });

    expect(result.error).toBeUndefined();
    expect(result.result).toBeTruthy();
    expect(Array.isArray(result.result)).toBe(true);
    expect((result.result as any[]).length).toBe(3);
    expect(result.executionTimeMs).toBeGreaterThanOrEqual(0);

    // Verify results are sorted by age
    const resultArray = result.result as any[];
    expect(resultArray[0].name).toBe("Jane");
    expect(resultArray[0].age).toBe(28);
  });

  it("should execute aggregation query with EJSON formatting", async () => {
    // Test case 2: aggregation pipeline that needs EJSON formatting (ObjectId, Date)
    const specificObjectId = users[0]._id;
    const pipeline = JSON.stringify([
      {
        $match: {
          $or: [
            { _id: { $oid: specificObjectId.toHexString() } },
            { createdAt: { $date: "2023-02-01T00:00:00.000Z" } },
          ],
        },
      },
      { $project: { name: 1, age: 1, createdAt: 1 } },
    ]);

    const result = await executeEjsonAggregation({
      query: pipeline,
      databaseName,
      collectionName,
    });

    expect(result.error).toBeUndefined();
    expect(result.result).toBeTruthy();
    expect(Array.isArray(result.result)).toBe(true);
    expect((result.result as any[]).length).toBe(2);
    expect(result.executionTimeMs).toBeGreaterThanOrEqual(0);

    // Verify we got the expected documents
    const resultArray = result.result as any[];
    const names = resultArray.map((doc: any) => doc.name);
    expect(names).toContain("John");
    expect(names).toContain("Jane");
  });

  it("should throw error when query is a string instead of array", async () => {
    // Test case 3: should handle error when query is string instead of array
    const invalidQuery = "db.users.find()"; // This should be an array

    const result = await executeEjsonAggregation({
      query: invalidQuery as any,
      databaseName,
      collectionName,
    });

    expect(result.error).toBeDefined();
    expect(result.error?.message).toEqual(expect.any(String));
    expect(result.result).toBeNull();
    expect(result.executionTimeMs).toBeNull();
  });

  it("should handle database execution errors gracefully", async () => {
    // Test case: invalid aggregation pipeline
    const invalidPipeline = JSON.stringify([{ $invalidStage: {} }]);

    const result = await executeEjsonAggregation({
      query: invalidPipeline,
      databaseName,
      collectionName,
    });

    expect(result.error).toBeDefined();
    expect(result.result).toBeNull();
    expect(result.executionTimeMs).toBeNull();
  });

  it("should handle complex EJSON types correctly", async () => {
    // Test with more complex EJSON types like NumberLong, Decimal128
    const pipeline = JSON.stringify([
      {
        $addFields: {
          bigNumber: { $numberLong: "9223372036854775807" },
          decimalValue: { $numberDecimal: "123.456" },
        },
      },
      {
        $match: { age: { $gte: 28 } },
      },
      {
        $project: {
          name: 1,
          age: 1,
          bigNumber: 1,
          decimalValue: 1,
        },
      },
    ]);

    const result = await executeEjsonAggregation({
      query: pipeline,
      databaseName,
      collectionName,
    });

    expect(result.error).toBeUndefined();
    expect(result.result).toBeTruthy();
    expect(Array.isArray(result.result)).toBe(true);
    expect((result.result as any[]).length).toBe(3);
    expect(result.executionTimeMs).toBeGreaterThanOrEqual(0);
  });
});
