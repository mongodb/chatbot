import {
  CommandMetadataStore,
  makeMongoDbCommandMetadataStore,
} from "./CommandMetadataStore";
import { Db, MongoClient, ObjectId } from "mongodb-rag-core";
import { strict as assert } from "assert";
describe("MongoDbCommandMetadataStore", () => {
  const { MONGODB_CONNECTION_URI } = process.env;
  assert(MONGODB_CONNECTION_URI);
  const connectionUri = MONGODB_CONNECTION_URI;
  const client = new MongoClient(connectionUri);

  let testDbName: string;
  let db: Db;
  let commandMetadataStore: CommandMetadataStore;

  beforeEach(() => {
    testDbName = "test" + Math.random().toString(36).substring(7);
    db = client.db(testDbName);
    commandMetadataStore = makeMongoDbCommandMetadataStore({
      connectionUri: connectionUri,
      databaseName: testDbName,
    });
  });
  afterEach(async () => {
    await db.dropDatabase();
    await commandMetadataStore.close();
  });
  it("should insert new command metadata", async () => {
    const metadata = {
      _id: new ObjectId(),
      commandName: "foo",
      startTime: new Date(),
      endTime: new Date(),
    };
    const inserted = await commandMetadataStore.insertOne(metadata);
    expect(inserted).toBe(true);
  });
  it("should find command metadata by id", async () => {
    const metadata = {
      _id: new ObjectId(),
      commandName: "bar",
      startTime: new Date(),
      endTime: new Date(),
    };
    await commandMetadataStore.insertOne(metadata);
    const foundMetadata = await commandMetadataStore.findById(metadata._id);
    expect(foundMetadata).toMatchObject(metadata);
  });
});
