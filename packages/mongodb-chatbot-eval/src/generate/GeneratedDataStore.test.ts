import { Db, MongoClient, ObjectId } from "mongodb-rag-core";
import { strict as assert } from "assert";
import {
  GeneratedData,
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
  it("should insert new generated data", async () => {
    const generatedData = {
      _id: new ObjectId(),
      commandRunId: new ObjectId(),
      data: "foo",
      type: "bar",
      evalData: {
        fizz: "buzz",
      },
    } satisfies GeneratedData;
    const inserted = await generatedDataStore.insertOne(generatedData);
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
    } satisfies GeneratedData;
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
    } satisfies GeneratedData;
    await generatedDataStore.insertOne(generatedData);
    const found = await generatedDataStore.find({ data: "foo" });
    expect(found && found[0]).toMatchObject(generatedData);
  });
});
