import { strict as assert } from "assert";
import { assertEnvVars } from "../assertEnvVars";
import { CORE_ENV_VARS } from "../CoreEnvVars";
import "dotenv/config";
import { MongoClient } from "mongodb";
import { MONGO_MEMORY_SERVER_URI } from "../test/constants";
import {
  makeMongoDbSearchResultsStore,
  MongoDbSearchResultsStore,
  SearchResultRecord,
} from "./MongoDbSearchResultsStore";

const { MONGODB_CONNECTION_URI, MONGODB_DATABASE_NAME } =
  assertEnvVars(CORE_ENV_VARS);

describe("MongoDbSearchResultsStore", () => {
  let store: MongoDbSearchResultsStore | undefined;
  const searchResultRecord: SearchResultRecord = {
    query: "What is MongoDB Atlas?",
    results: [],
    dataSources: [{ name: "source1", type: "docs" }],
    createdAt: new Date(),
  };
  const uri = MONGO_MEMORY_SERVER_URI;

  beforeAll(async () => {
    store = makeMongoDbSearchResultsStore({
      connectionUri: uri,
      databaseName: "test-search-content-database",
    });
  });

  afterEach(async () => {
    await store?.drop();
  });
  afterAll(async () => {
    await store?.close();
  });

  it("has an overridable default collection name", async () => {
    assert(store);

    expect(store.metadata.collectionName).toBe("search_results");

    const storeWithCustomCollectionName = makeMongoDbSearchResultsStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: store.metadata.databaseName,
      collectionName: "custom-search_results",
    });

    expect(storeWithCustomCollectionName.metadata.collectionName).toBe(
      "custom-search_results"
    );
  });

  describe("saveSearchResult", () => {
    it("saves search result records to db", async () => {
      assert(store);
      await store.saveSearchResult(searchResultRecord);

      // Check for record in db
      const client = new MongoClient(uri);
      await client.connect();
      const db = client.db(store.metadata.databaseName);
      const collection = db.collection<SearchResultRecord>("search_results");
      const found = await collection.findOne(searchResultRecord);

      expect(found).toBeTruthy();
      // Optionally, check specific fields
      expect(found?.query).toBe(searchResultRecord.query);

      await client.close();
    });
    it("does NOT save badly formed record", async () => {
      assert(store);
      const badSearchResultRecord = {
        query: "What is aggregation?",
        results: [],
        dataSources: [{ type: "docs" }],
        createdAt: new Date(),
      };
      await expect(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        store.saveSearchResult(badSearchResultRecord)
      ).rejects.toThrow();
    });
  });
});

describe("initializes DB", () => {
  let store: MongoDbSearchResultsStore | undefined;
  let mongoClient: MongoClient | undefined;

  beforeEach(async () => {
    store = makeMongoDbSearchResultsStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_DATABASE_NAME,
    });
    mongoClient = new MongoClient(MONGODB_CONNECTION_URI);
  });

  afterEach(async () => {
    assert(store);
    assert(mongoClient);
    await store.close();
    await mongoClient.close();
  });

  it("creates indexes", async () => {
    assert(store);
    await store.init();

    const coll = mongoClient
      ?.db(store.metadata.databaseName)
      .collection<SearchResultRecord>(store.metadata.collectionName);
    const indexes = await coll?.listIndexes().toArray();
    expect(indexes?.some((el) => el.name === "createdAt_-1")).toBe(true);
  });
});
