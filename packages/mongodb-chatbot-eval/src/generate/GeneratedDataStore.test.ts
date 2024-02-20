import { Db, MongoClient, ObjectId } from "mongodb-rag-core";
import { strict as assert } from "assert";
import {
  SomeGeneratedData,
  GeneratedDataStore,
  makeMongoDbGeneratedDataStore,
} from "./GeneratedDataStore";

describe("MongoDbGeneratedDataStore", () => {
  const { MONGODB_CONNECTION_URI } = process.env;
  assert(MONGODB_CONNECTION_URI);
  const connectionUri = MONGODB_CONNECTION_URI;
  const client = new MongoClient(connectionUri);

  let testDbName: string;
  let db: Db;
  let generatedDataStore: GeneratedDataStore;

  beforeEach(() => {
    testDbName = "test" + Math.random().toString(36).substring(7);
    db = client.db(testDbName);
    generatedDataStore = makeMongoDbGeneratedDataStore({
      connectionUri: connectionUri,
      databaseName: testDbName,
    });
  });
  afterEach(async () => {
    await db.dropDatabase();
    await generatedDataStore.close();
  });

  it("should insert one new generated data", async () => {
    const generatedData = {
      _id: new ObjectId(),
      commandRunId: new ObjectId(),
      data: "foo",
      type: "bar",
      evalData: {
        fizz: "buzz",
      },
    } satisfies SomeGeneratedData;
    const inserted = await generatedDataStore.insertOne(generatedData);
    expect(inserted).toBe(true);
  });
  it("should insert many new generated data", async () => {
    const generatedData1 = {
      _id: new ObjectId(),
      commandRunId: new ObjectId(),
      data: "foo",
      type: "bar",
      evalData: {
        fizz: "buzz",
      },
    } satisfies SomeGeneratedData;
    const generatedData2 = {
      _id: new ObjectId(),
      commandRunId: new ObjectId(),
      data: "fizz",
      type: "buzz",
      evalData: {
        buzz: "fizz",
      },
    } satisfies SomeGeneratedData;
    const inserted = await generatedDataStore.insertMany([
      generatedData1,
      generatedData2,
    ]);
    expect(inserted).toBe(true);
  });
  it("should find generated data by id", async () => {
    const generatedData = {
      _id: new ObjectId(),
      commandRunId: new ObjectId(),
      data: "foo",
      type: "bar",
      evalData: {
        fizz: "buzz",
      },
    } satisfies SomeGeneratedData;
    await generatedDataStore.insertOne(generatedData);
    const foundData = await generatedDataStore.findById(generatedData._id);
    expect(foundData).toMatchObject(generatedData);
  });
  it("should find data with arbitrary mongodb filter", async () => {
    const generatedData = {
      _id: new ObjectId(),
      commandRunId: new ObjectId(),
      data: "foo",
      type: "bar",
      evalData: {
        fizz: "buzz",
      },
    } satisfies SomeGeneratedData;
    await generatedDataStore.insertOne(generatedData);
    const found = await generatedDataStore.find({ data: "foo" });
    expect(found && found[0]).toMatchObject(generatedData);
  });
});
