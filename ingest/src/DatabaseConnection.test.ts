import { strict as assert } from "assert";
import { ObjectId } from "mongodb";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import {
  makeDatabaseConnection,
  DatabaseConnection,
} from "./DatabaseConnection";
import { PageStore, PersistedPage } from "./updatePages";
import { ChunkStore, EmbeddedChunk } from "./updateChunks";

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
  let store: (DatabaseConnection & PageStore & ChunkStore) | undefined;
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

  it("handles chunks", async () => {
    assert(store);

    const page: PersistedPage = {
      action: "created",
      body: "foo",
      format: "md",
      source: "source1",
      tags: [],
      updated: new Date(),
      url: "/x/y/z",
    };

    const chunks = await store.loadChunks({ page });
    expect(chunks).toStrictEqual([]);

    await store.updateChunks({
      page,
      chunks: [
        { embedding: [], source: page.source, text: "foo", url: page.url },
      ],
    });

    expect(await store.loadChunks({ page })).toMatchObject([
      {
        embedding: [],
        source: "source1",
        text: "foo",
        url: "/x/y/z",
      },
    ]);

    // Won't find chunks for some other page
    expect(
      await store.loadChunks({ page: { ...page, source: "source2" } })
    ).toStrictEqual([]);
    expect(
      await store.loadChunks({ page: { ...page, url: page.url + "/" } })
    ).toStrictEqual([]);

    // Won't delete some other page's chunks
    await store.deleteChunks({ page: { ...page, source: "source2" } });
    expect((await store.loadChunks({ page })).length).toBe(1);

    // Deletes chunks for page
    await store.deleteChunks({ page });
    expect(await store.loadChunks({ page })).toStrictEqual([]);
  });

  it("handles pages", async () => {
    assert(store);

    const page: PersistedPage = {
      action: "created",
      body: "foo",
      format: "md",
      source: "source1",
      tags: [],
      updated: new Date(),
      url: "/x/y/z",
    };

    let pages = await store.loadPages({ source: "source1" });
    expect(pages).toStrictEqual([]);

    await store.updatePages([
      { ...page, url: "1" },
      { ...page, url: "2" },
      { ...page, url: "3" },
    ]);

    pages = await store.loadPages({ source: "source1" });
    expect(pages.length).toBe(3);
    expect(pages[1]).toMatchObject({ url: "2", action: "created" });

    await store.updatePages([{ ...page, url: "2", action: "deleted" }]);

    pages = await store.loadPages({ source: "source1" });
    expect(pages.length).toBe(3);
    expect(pages[1]).toMatchObject({ url: "2", action: "deleted" });
  });
});
