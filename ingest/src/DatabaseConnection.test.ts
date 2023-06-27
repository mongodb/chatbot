import { strict as assert } from "assert";
import { ObjectId } from "mongodb";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import {
  makeDatabaseConnection,
  DatabaseConnection,
} from "./DatabaseConnection";
import { PageStore, PersistedPage } from "./updatePages";
import { EmbeddedContentStore } from "./updateEmbeddedContent";

export type DbServer = {
  connectionUri: string;
  stop(): Promise<boolean>;
};

export const makeDbServer = async (): Promise<DbServer> => {
  const mongod = await MongoMemoryReplSet.create();
  const connectionUri = mongod.getUri();
  return {
    connectionUri,
    stop: () => mongod.stop(),
  };
};

let server: DbServer | undefined;

beforeAll(async () => {
  server = await makeDbServer();
});

afterAll(async () => {
  await server?.stop();
});

describe("DatabaseConnection", () => {
  let store:
    | (DatabaseConnection & PageStore & EmbeddedContentStore)
    | undefined;
  beforeEach(async () => {
    assert(server !== undefined);
    store = await makeDatabaseConnection({
      connectionUri: server.connectionUri,
      databaseName: `test-${ObjectId.generate()}`,
    });
    assert(store);
  });

  afterEach(async () => {
    assert(store);
    await store.close();
  });

  it("handles embedded content", async () => {
    assert(store);

    const page: PersistedPage = {
      action: "created",
      body: "foo",
      format: "md",
      sourceName: "source1",
      tags: [],
      updated: new Date(),
      url: "/x/y/z",
    };

    const embeddedContent = await store.loadEmbeddedContent({ page });
    expect(embeddedContent).toStrictEqual([]);

    await store.updateEmbeddedContent({
      page,
      embeddedContent: [
        { embedding: [], source: page.sourceName, text: "foo", url: page.url },
      ],
    });

    expect(await store.loadEmbeddedContent({ page })).toMatchObject([
      {
        embedding: [],
        sourceName: "source1",
        text: "foo",
        url: "/x/y/z",
      },
    ]);

    // Won't find embedded content for some other page
    expect(
      await store.loadEmbeddedContent({
        page: { ...page, sourceName: "source2" },
      })
    ).toStrictEqual([]);
    expect(
      await store.loadEmbeddedContent({
        page: { ...page, url: page.url + "/" },
      })
    ).toStrictEqual([]);

    // Won't delete some other page's embedded content
    await store.deleteEmbeddedContent({
      page: { ...page, sourceName: "source2" },
    });
    expect((await store.loadEmbeddedContent({ page })).length).toBe(1);

    // Deletes embedded content for page
    await store.deleteEmbeddedContent({ page });
    expect(await store.loadEmbeddedContent({ page })).toStrictEqual([]);
  });

  it("handles pages", async () => {
    assert(store);

    const page: PersistedPage = {
      action: "created",
      body: "foo",
      format: "md",
      sourceName: "source1",
      tags: [],
      updated: new Date(),
      url: "/x/y/z",
    };

    let pages = await store.loadPages({ sourceName: "source1" });
    expect(pages).toStrictEqual([]);

    await store.updatePages([
      { ...page, url: "1" },
      { ...page, url: "2" },
      { ...page, url: "3" },
    ]);

    pages = await store.loadPages({ sourceName: "source1" });
    expect(pages.length).toBe(3);
    expect(pages[1]).toMatchObject({ url: "2", action: "created" });

    await store.updatePages([{ ...page, url: "2", action: "deleted" }]);

    pages = await store.loadPages({ sourceName: "source1" });
    expect(pages.length).toBe(3);
    expect(pages[1]).toMatchObject({ url: "2", action: "deleted" });
  });
});
