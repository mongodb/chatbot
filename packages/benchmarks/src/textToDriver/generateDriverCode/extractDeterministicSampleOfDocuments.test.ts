import { MongoClient, UUID } from "mongodb-rag-core";
import { MongoMemoryServer } from "mongodb-memory-server";
import {
  extractDeterministicSampleOfDocuments,
  MUST_HAVE_AT_LEAST_ONE_EXAMPLE_DOCUMENT_ERROR,
} from "./extractDeterministicSampleOfDocuments";
import { ObjectId } from "mongodb-rag-core";

describe("extractDeterministicSampleOfDocuments", () => {
  let mongod: MongoMemoryServer;
  let mongoClient: MongoClient;
  const dbName = "testdb";
  const collectionName = "testCollection";
  jest.setTimeout(60000);

  beforeAll(async () => {
    // Start the in-memory MongoDB server
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    // Create a new MongoClient connected to the in-memory MongoDB
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
  });

  afterAll(async () => {
    await mongoClient.close();
    await mongod.stop();
  });

  afterEach(async () => {
    // Clean up after each test by dropping the database
    const db = mongoClient.db(dbName);
    await db.dropDatabase();
  });

  it("should return deterministic sample of documents", async () => {
    // Insert some sample documents
    const sampleDocuments = [
      { _id: new ObjectId(), name: "Document 1" },
      { _id: new ObjectId(), name: "Document 2" },
      { _id: new ObjectId(), name: "Document 3" },
      { _id: new ObjectId(), name: "Document 4" },
      { _id: new ObjectId(), name: "Document 5" },
      { _id: new ObjectId(), name: "Document 6" },
    ];

    const collection = mongoClient.db(dbName).collection(collectionName);
    await collection.insertMany(sampleDocuments);

    const results = [];
    const NUM_RUNS = 10;
    for (let i = 0; i < NUM_RUNS; i++) {
      const result = await extractDeterministicSampleOfDocuments({
        mongoClient,
        collectionName,
        databaseName: dbName,
      });
      results.push(result);
    }
    for (let i = 0; i < NUM_RUNS - 1; i++) {
      expect(results[i]).toEqual(results[i + 1]);
    }
  });

  it("should limit documents to provided number", async () => {
    // Insert some sample documents
    const sampleDocuments = [
      { _id: new ObjectId(), name: "Document 1" },
      { _id: new ObjectId(), name: "Document 2" },
      { _id: new ObjectId(), name: "Document 3" },
    ];

    const collection = mongoClient.db(dbName).collection(collectionName);
    await collection.insertMany(sampleDocuments);

    const result = await extractDeterministicSampleOfDocuments({
      mongoClient,
      collectionName,
      databaseName: dbName,
      limit: 2,
    });

    // The result should contain only 2 documents due to the limit
    expect(result.length).toBe(2);
  });
  it("should throw an error if no documents are found", async () => {
    await expect(
      extractDeterministicSampleOfDocuments({
        mongoClient,
        collectionName,
        databaseName: new UUID().toString(), // definitely not a valid database name
      })
    ).rejects.toThrow(MUST_HAVE_AT_LEAST_ONE_EXAMPLE_DOCUMENT_ERROR);
  });
});
