import { strict as assert } from "assert";
import "dotenv/config";
import { MongoClient } from "mongodb";
import { MONGO_MEMORY_SERVER_URI } from "../test/constants";
import {
  makeMongoDbSearchResultsStore,
  MongoDbSearchResultsStore,
  SearchResultRecord,
} from "./MongoDbSearchResultsStore";

const searchResultRecord: SearchResultRecord = {
  query: "What is MongoDB Atlas?",
  results: [
    {
      url: "foo",
      title: "bar",
      text: "baz",
      metadata: {
        sourceName: "source",
      },
    },
  ],
  dataSources: [{ name: "source1", type: "docs" }],
  createdAt: new Date(),
};
const uri = MONGO_MEMORY_SERVER_URI;

describe("MongoDbSearchResultsStore", () => {
  let store: MongoDbSearchResultsStore | undefined;

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
      connectionUri: uri,
      databaseName: store.metadata.databaseName,
      collectionName: "custom-search_results",
    });

    expect(storeWithCustomCollectionName.metadata.collectionName).toBe(
      "custom-search_results"
    );
  });

  it("creates indexes", async () => {
    assert(store);
    await store.init();

    const mongoClient = new MongoClient(uri);
    const coll = mongoClient
      ?.db(store.metadata.databaseName)
      .collection<SearchResultRecord>(store.metadata.collectionName);
    const indexes = await coll?.listIndexes().toArray();

    expect(indexes?.some((el) => el.name === "createdAt_-1")).toBe(true);
    await mongoClient.close();
  });

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
    expect(found).toMatchObject(searchResultRecord);

    await client.close();
  });
});
