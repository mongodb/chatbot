import {
  MongoClient,
  Db,
  Collection,
  Document,
} from "mongodb-rag-core/mongodb";
import { executeGeneratedDriverCode } from "./executeGeneratedDriverCode";
import { MONGO_MEMORY_SERVER_URI } from "../test/constants";

describe("executeGeneratedDriverCode", () => {
  jest.setTimeout(60000);
  let mongoClient: MongoClient;
  let db: Db;
  let collection: Collection<Document>;
  const databaseName = "executeGeneratedDriverCode";
  const collectionName = "testCollection";

  beforeAll(async () => {
    // Start in-memory MongoDB instance
    const uri = MONGO_MEMORY_SERVER_URI;

    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    db = mongoClient.db(databaseName);
    collection = db.collection(collectionName);

    // Insert sample data
    await collection.insertMany([
      { name: "Alice", age: 30 },
      { name: "Bob", age: 25 },
    ]);
  });

  afterAll(async () => {
    // Clean up
    await mongoClient.close();
  });

  it("should execute generated driver code", async () => {
    const generatedDriverCode = `database.collection("${collectionName}").find({ name: "Alice" }).toArray()`;
    const result = await executeGeneratedDriverCode({
      mongoClient,
      generatedDriverCode,
      databaseName,
    });

    expect(result.result).toMatchObject([{ name: "Alice", age: 30 }]);
    expect(result.error).toBeUndefined();
    expect(result.executionTimeMs).toBeGreaterThan(0);
  });
  it("should execute generated driver code with inline comments", async () => {
    const generatedDriverCode = `// hey there
database.collection("${collectionName}").find({ name: "Alice" }).toArray()`;
    const result = await executeGeneratedDriverCode({
      mongoClient,
      generatedDriverCode,
      databaseName,
    });

    expect(result.result).toMatchObject([{ name: "Alice", age: 30 }]);
    expect(result.error).toBeUndefined();
    expect(result.executionTimeMs).toBeGreaterThan(0);
  });
  it("should execute generated driver code with block comments", async () => {
    const generatedDriverCode = `/*
  hey there
*/
database.collection("${collectionName}").find({ name: "Alice" }).toArray()`;
    const result = await executeGeneratedDriverCode({
      mongoClient,
      generatedDriverCode,
      databaseName,
    });

    expect(result.result).toMatchObject([{ name: "Alice", age: 30 }]);
    expect(result.error).toBeUndefined();
    expect(result.executionTimeMs).toBeGreaterThan(0);
  });
  it("should return an error if an error occurs during execution", async () => {
    const errorMessage = "An unknown error occurred";
    // Note: wrapping with IFEE b/c we must use eval()
    // with an _expression_ (like the IFEE)
    // not a statement (like `throw ...`)
    const generatedDriverCode = `(() => { throw new Error("${errorMessage}"); })()`;
    const result = await executeGeneratedDriverCode({
      mongoClient,
      generatedDriverCode,
      databaseName,
    });

    expect(result.error?.message).toBe(errorMessage);
    expect(result.result).toBeNull();
    expect(result.executionTimeMs).toBeGreaterThanOrEqual(0);
  });
  it("should execute code in markdown code block", async () => {
    const generatedDriverCode = `
\`\`\`js
database.collection("${collectionName}").find({ name: "Alice" }).toArray()
\`\`\`
    `;
    const result = await executeGeneratedDriverCode({
      mongoClient,
      generatedDriverCode,
      databaseName,
    });

    expect(result.result).toMatchObject([{ name: "Alice", age: 30 }]);
    expect(result.error).toBeUndefined();
    expect(result.executionTimeMs).toBeGreaterThan(0);
  });
  it("should execute code with trailing semicolon", async () => {
    const generatedDriverCode = `database.collection("${collectionName}").find({ name: "Alice" }).toArray();`;
    const result = await executeGeneratedDriverCode({
      mongoClient,
      generatedDriverCode,
      databaseName,
    });

    expect(result.result).toMatchObject([{ name: "Alice", age: 30 }]);
    expect(result.error).toBeUndefined();
    expect(result.executionTimeMs).toBeGreaterThan(0);
  });
});
