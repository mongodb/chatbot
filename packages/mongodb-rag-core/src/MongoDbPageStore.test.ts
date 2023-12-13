import { strict as assert } from "assert";
import { DatabaseConnection } from "./DatabaseConnection";
import { makeMongoDbPageStore } from "./MongoDbPageStore";
import { PageStore, PersistedPage } from "./Page";
import { assertEnvVars } from "./assertEnvVars";
import { CORE_ENV_VARS } from "./CoreEnvVars";
import "dotenv/config";

const { MONGODB_CONNECTION_URI } = assertEnvVars(CORE_ENV_VARS);

describe("MongoDbPageStore", () => {
  let store: (DatabaseConnection & PageStore) | undefined;
  beforeEach(async () => {
    // Need to use real Atlas connection in order to run vector searches
    const databaseName = `test-database-${Date.now()}`;
    store = await makeMongoDbPageStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName,
    });
  });

  afterEach(async () => {
    assert(store);
    await store.drop();
    await store.close();
  });

  it("handles pages", async () => {
    assert(store);

    const page: PersistedPage = {
      action: "created",
      body: "foo",
      format: "md",
      sourceName: "source1",
      metadata: {
        tags: [],
      },
      updated: new Date(),
      url: "/x/y/z",
    };

    let pages = await store.loadPages({ sources: ["source1"] });
    expect(pages).toStrictEqual([]);

    await store.updatePages([
      { ...page, url: "1" },
      { ...page, url: "2" },
      { ...page, url: "3" },
    ]);

    pages = await store.loadPages({ sources: ["source1"] });
    expect(pages.length).toBe(3);
    expect(pages.find(({ url }) => url === "2")).toMatchObject({
      url: "2",
      action: "created",
    });

    await store.updatePages([{ ...page, url: "2", action: "deleted" }]);

    pages = await store.loadPages({ sources: ["source1"] });
    expect(pages.length).toBe(3);
    expect(pages.find(({ url }) => url === "2")).toMatchObject({
      url: "2",
      action: "deleted",
    });
  });

  it("loads pages that have changed since the given date", async () => {
    assert(store);

    await store.updatePages([
      {
        action: "created",
        body: "The Matrix (1999) comes out",
        format: "md",
        sourceName: "",
        metadata: {
          tags: [],
        },
        updated: new Date("1999-03-31"),
        url: "matrix1",
      },
      {
        action: "created",
        body: "The Matrix: Reloaded (2003) comes out",
        format: "md",
        sourceName: "",
        metadata: {
          tags: [],
        },
        updated: new Date("2003-05-15"),
        url: "matrix2",
      },
    ]);

    const changedPages = await store.loadPages({
      updated: new Date("2000-01-01"),
    });

    expect(changedPages.length).toBe(1);
    expect(changedPages[0].url).toBe("matrix2");
  });

  it("loads pages by URL", async () => {
    assert(store);

    await store.updatePages([
      {
        action: "created",
        body: "Page One",
        format: "md",
        sourceName: "",
        metadata: {
          tags: [],
        },
        updated: new Date("2000-01-01"),
        url: "page-one",
      },
      {
        action: "created",
        body: "Page Two",
        format: "md",
        sourceName: "",
        metadata: {
          tags: [],
        },
        updated: new Date("2000-01-02"),
        url: "page-two",
      },
    ]);

    const pages = await store.loadPages({ urls: ["page-two"] });

    expect(pages.length).toBe(1);
    expect(pages[0].url).toBe("page-two");
  });

  it("supports custom MongoDB queries", async () => {
    assert(store);

    await store.updatePages([
      {
        action: "created",
        body: "The Matrix (1999) comes out",
        format: "md",
        sourceName: "",
        metadata: {
          tags: [],
        },
        updated: new Date("1999-03-31"),
        url: "matrix1",
      },
      {
        action: "created",
        body: "The Matrix: Reloaded (2003) comes out",
        format: "md",
        sourceName: "",
        metadata: {
          tags: [],
        },
        updated: new Date("2003-05-15"),
        url: "matrix2",
      },
      {
        action: "created",
        body: "The Matrix: Revolutions (2003) comes out",
        format: "md",
        sourceName: "",
        metadata: {
          tags: [],
        },
        updated: new Date("2003-11-05"),
        url: "matrix3",
      },
    ]);

    const sequels = await store.loadPages({
      query: {
        $or: [{ url: "matrix3" }, { updated: { $gt: new Date("2000-01-01") } }],
      },
    });

    expect(sequels.length).toBe(2);
    expect(sequels[0].url).toBe("matrix2");
  });
});
