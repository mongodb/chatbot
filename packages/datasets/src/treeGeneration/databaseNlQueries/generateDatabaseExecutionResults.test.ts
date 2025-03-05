import { jest } from "@jest/globals";
import { executeMqlQuery } from "./generateDatabaseExecutionResults";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, ObjectId } from "mongodb-rag-core/mongodb";
import { MONGO_MEMORY_SERVER_URI } from "../../test/constants";

jest.setTimeout(1000 * 60);

describe("executeMqlQuery", () => {
  const mongoClient = new MongoClient(MONGO_MEMORY_SERVER_URI);
  const dbName = "test_db_" + Date.now().toString();
  const collectionName = "users";
  const collection = mongoClient.db(dbName).collection(collectionName);
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

  it.only("should execute a mongosh query and return results", async () => {
    // Execute the function
    const result = await executeMqlQuery(
      "db.users.find({ age: { $gt: 25 } })",
      MONGO_MEMORY_SERVER_URI,
      dbName
    );

    console.log(JSON.stringify(result, null, 2));

    // Verify the result
    expect(result.result).toEqual(users);
    expect(result.executionTimeMs).toBeGreaterThanOrEqual(0);
    expect(result.error).toBeUndefined();
  });

  it("should handle errors from mongosh execution", async () => {
    // TODO: make happen
  });

  it("should handle parsing errors from mongosh output", async () => {
    // TODO: make happen
  });

  it("should handle stderr output from mongosh", async () => {
    // TODO: make happen
  });
});
