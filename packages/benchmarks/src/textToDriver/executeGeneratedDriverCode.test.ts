import { MongoClient, Db, Collection, Document } from "mongodb-rag-core";
import { MongoMemoryServer } from "mongodb-memory-server";
import { executeGeneratedDriverCode } from "./executeGeneratedDriverCode";
describe("executeGeneratedDriverCode", () => {
  jest.setTimeout(60000);
  let mongoServer: MongoMemoryServer;
  let mongoClient: MongoClient;
  let db: Db;
  let collection: Collection<Document>;
  const databaseName = "testdb";
  const collectionName = "testCollection";

  beforeAll(async () => {
    // Start in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

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
    await mongoServer.stop();
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
    const errorMessage = "An error occurred";
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
});
