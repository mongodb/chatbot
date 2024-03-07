import { Db, MongoClient, ObjectId } from "mongodb-rag-core";
import { strict as assert } from "assert";
import {
  makeMongoDbReportStore,
  Report,
  MongoDbReportStore,
} from "./ReportStore";

describe("MongoDbReportStore", () => {
  const { MONGODB_CONNECTION_URI } = process.env;
  assert(MONGODB_CONNECTION_URI);
  const connectionUri = MONGODB_CONNECTION_URI;
  const client = new MongoClient(connectionUri);

  let testDbName: string;
  let db: Db;
  let evalStore: MongoDbReportStore;

  beforeEach(() => {
    testDbName = "test" + Math.random().toString(36).substring(7);
    db = client.db(testDbName);
    evalStore = makeMongoDbReportStore({
      connectionUri: connectionUri,
      databaseName: testDbName,
    });
  });
  afterEach(async () => {
    await db.dropDatabase();
    await evalStore.close();
  });

  it("should insert new data", async () => {
    const report = {
      _id: new ObjectId(),
      name: "foo",
      type: "bar",
      commandRunMetadataId: new ObjectId(),
      data: { fizz: "buzz" },
      createdAt: new Date(),
    } satisfies Report;
    const inserted = await evalStore.insertOne(report);
    expect(inserted).toBe(true);
  });
  it("should find data with arbitrary mongodb filter", async () => {
    const report = {
      _id: new ObjectId(),
      name: "foo",
      type: "bar",
      commandRunMetadataId: new ObjectId(),
      data: { fizz: "buzz" },
      createdAt: new Date(),
    } satisfies Report;
    await evalStore.insertOne(report);
    const found = await evalStore.find({
      reportName: "foo",
      "data.fizz": "buzz",
    });
    expect(found && found[0]).toMatchObject(report);
  });
});
