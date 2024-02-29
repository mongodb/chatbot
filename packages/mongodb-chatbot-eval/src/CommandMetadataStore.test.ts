import {
  CommandMetadataStore,
  CommandRunMetadata,
  convertCommandRunMetadataToJson,
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
      command: "evaluate",
      name: "bar",
      startTime: new Date(),
      endTime: new Date(),
    } satisfies CommandRunMetadata;
    const inserted = await commandMetadataStore.insertOne(metadata);
    expect(inserted).toBe(true);
  });
  it("should find command metadata by id", async () => {
    const metadata = {
      _id: new ObjectId(),
      command: "generate",
      name: "foo",
      startTime: new Date(),
      endTime: new Date(),
    } satisfies CommandRunMetadata;
    await commandMetadataStore.insertOne(metadata);
    const foundMetadata = await commandMetadataStore.findById(metadata._id);
    expect(foundMetadata).toMatchObject(metadata);
  });
});

describe("convertCommandRunMetadataToJson", () => {
  test("should convert CommandRunMetadata to JSON-compatible object", () => {
    const metadata = {
      _id: new ObjectId(),
      command: "report",
      name: "bar",
      startTime: new Date(),
      endTime: new Date(),
    } satisfies CommandRunMetadata;
    const json = convertCommandRunMetadataToJson(metadata);
    expect(json).toMatchObject({
      _id: metadata._id.toHexString(),
      command: metadata.command,
      name: metadata.name,
      startTime: metadata.startTime.getTime(),
      endTime: metadata.endTime.getTime(),
    });
  });
});
