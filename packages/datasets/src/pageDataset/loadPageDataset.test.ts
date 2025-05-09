import {
  makeMongoDbPageStore,
  PersistedPage,
  MongoDbPageStore,
} from "mongodb-rag-core";
import { loadPagesDataset } from "./loadPageDataset";
import { MONGO_MEMORY_SERVER_URI } from "../test/constants";
describe("loadPagesDataset", () => {
  let pageStore: MongoDbPageStore;

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
      sourceType: "tech-docs",
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
      sourceType: "tech-docs",
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
      sourceType: "tech-docs",
    },
    // This page does not match sourceType (even though it is active)
    {
      url: "https://example.com/page4",
      body: "Page 4 body",
      metadata: { extra: "info4" },
      title: "Page 4",
      sourceName: "SourceD",
      updated: new Date(),
      format: "html",
      action: "created",
      sourceType: "blog",
    },
    {
      url: "https://example.com/page5",
      body: "Page 5 body",
      metadata: { extra: "info1", version: { isCurrent: true, label: 'current' } }, 
      title: "Page 5",
      sourceName: "SourceE",
      updated: new Date(),
      format: "html",
      action: "updated",
      sourceType: "tech-docs",
    },
    // This page represents an older version and should not be returned
    {
      url: "https://example.com/old-version/page5",
      body: "Page 5 body",
      metadata: { extra: "info5", version: { isCurrent: false, label: 'old-version' } }, 
      title: "Page 5",
      sourceName: "SourceE",
      updated: new Date(),
      format: "html",
      action: "updated",
      sourceType: "tech-docs",
    },
  ];

  beforeAll(async () => {
    // Create the MongoDbPageStore
    pageStore = makeMongoDbPageStore({
      connectionUri: MONGO_MEMORY_SERVER_URI,
      databaseName: "testdb",
      collectionName: "pages",
    });

    await pageStore.updatePages(samplePages);
  });

  afterAll(async () => {
    await pageStore.drop();
    await pageStore.close();
  });

  it("should only return pages matching a sourceType", async () => {
    const dataset = await loadPagesDataset({
      pageStore,
      forbiddenUrls: [],
      dataSourceTypes: ["tech-docs"],
    });
    // page1 should be returned as it matches the sourceType, page 4 does not match
    expect(dataset.map((p) => p.url)).toContain("https://example.com/page1");
    expect(dataset.map((p) => p.url)).not.toContain(
      "https://example.com/page4"
    );
  });

  it("should exclude forbidden urls", async () => {
    const dataset = await loadPagesDataset({
      pageStore,
      forbiddenUrls: [samplePages[1].url],
      dataSourceTypes: ["devcenter", "tech-docs"],
    });
    expect(dataset.map((p) => p.url)).toContain("https://example.com/page1");
    expect(dataset.map((p) => p.url)).not.toContain(
      "https://example.com/page2"
    );
  });

  it("should not include pages with action 'deleted'", async () => {
    const dataset = await loadPagesDataset({
      pageStore,
      forbiddenUrls: [],
      dataSourceTypes: ["devcenter", "tech-docs"],
    });
    const urls = dataset.map((p) => p.url);
    expect(urls.length).toBeGreaterThan(0);
    expect(urls).not.toContain("https://example.com/page3");
  });

  it("should not include pages representing a non current version", async () => {
    const dataset = await loadPagesDataset({
      pageStore,
      forbiddenUrls: [],
      dataSourceTypes: ["tech-docs"],
    });
    const urls = dataset.map((p) => p.url);
    expect(urls).toContain("https://example.com/page5");
    expect(urls).not.toContain("https://example.com/old-version/page5");
  });

  it("should only return the projected fields", async () => {
    const dataset = await loadPagesDataset({
      pageStore,
      forbiddenUrls: [],
      dataSourceTypes: ["devcenter", "tech-docs"],
    });
    expect(dataset.length).toBeGreaterThan(0);
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
