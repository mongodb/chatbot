// TODO: ...
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, Db, Collection } from "mongodb";
import {
  makeMongoDbPageStore,
  PersistedPage,
  MongoDbPageStore,
} from "mongodb-rag-core";
import { loadPagesDataset } from "./loadPageDataset";

describe("loadPagesDataset", () => {
  let mongoServer: MongoMemoryServer;
  let connectionUri: string;
  let client: MongoClient;
  let db: Db;
  let pageStore: MongoDbPageStore;
  let pagesCollection: Collection<PersistedPage>;

  // Create some sample pages
  const samplePages: PersistedPage[] = [
    // This page should match the regex and is not forbidden, and is not deleted.
    {
      url: "https://example.com/page1",
      body: "Page 1 body",
      metadata: { extra: "info1" },
      title: "Page 1",
      sourceName: "SourceA",
      updated: new Date(),
      format: "html",
      action: "updated",
    },
    // This page should be filtered out by forbidden url
    {
      url: "https://example.com/page2",
      body: "Page 2 body",
      metadata: { extra: "info2" },
      title: "Page 2",
      sourceName: "SourceB",
      updated: new Date(),
      format: "html",
      action: "updated",
    },
    // This page has action deleted, so should not be returned
    {
      url: "https://example.com/page3",
      body: "Page 3 body",
      metadata: { extra: "info3" },
      title: "Page 3",
      sourceName: "SourceC",
      updated: new Date(),
      format: "html",
      action: "deleted",
    },
    // This page does not match regex (even though it is active)
    {
      url: "https://example.com/page4",
      body: "Page 4 body",
      metadata: { extra: "info4" },
      title: "Page 4",
      sourceName: "SourceD",
      updated: new Date(),
      format: "html",
      action: "created",
    },
  ];

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    connectionUri = mongoServer.getUri();
    client = await MongoClient.connect(connectionUri);
    db = client.db("testdb");

    // Create the MongoDbPageStore
    pageStore = makeMongoDbPageStore({
      connectionUri,
      databaseName: "testdb",
      collectionName: "pages",
    });

    // Grab a reference to the underlying collection
    pagesCollection = db.collection<PersistedPage>("pages");

    // Populate the database with our sample pages
    await pagesCollection.insertMany(samplePages);
  });

  afterAll(async () => {
    await client.close();
    await mongoServer.stop();
  });

  it("should only return pages matching a regex", async () => {
    const dataset = await loadPagesDataset(pageStore, /SourceA/, []);
    // page1 should be returned, page2 as well if not forbidden & not deleted, page3 is deleted.
    // page4 is filtered out because dataSource doesn't match.
    expect(dataset.map((p) => p.url)).toContain("https://example.com/page1");
    expect(dataset.map((p) => p.url)).toContain("https://example.com/page2");
    expect(dataset.map((p) => p.url)).not.toContain(
      "https://example.com/page3"
    );
    expect(dataset.map((p) => p.url)).not.toContain(
      "https://example.com/page4"
    );
  });

  it("should exclude forbidden urls", async () => {
    const dataset = await loadPagesDataset(
      pageStore,
      /foo/,
      // forbid page2's URL
      [samplePages[1].url]
    );
    expect(dataset.map((p) => p.url)).toContain("https://example.com/page1");
    expect(dataset.map((p) => p.url)).not.toContain(
      "https://example.com/page2"
    );
  });

  it("should not include pages with action 'deleted'", async () => {
    const dataset = await loadPagesDataset(pageStore, /foo/, []);
    const urls = dataset.map((p) => p.url);
    expect(urls).not.toContain("https://example.com/page3");
  });

  it("should only return the projected fields", async () => {
    const dataset = await loadPagesDataset(pageStore, /foo/, []);
    for (const page of dataset) {
      const pageKeys = Object.keys(page);

      expect(pageKeys).toContain("url");
      expect(pageKeys).toContain("body");
      expect(pageKeys).toContain("title");
      expect(pageKeys).toContain("format");
      expect(pageKeys).toContain("metadata");
      expect(pageKeys).toContain("sourceName");
      expect(pageKeys).toContain("updated");
      expect(pageKeys).not.toContain("action");
    }
  });
});
