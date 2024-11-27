import {
  PageStore,
  makeMongoDbPageStore,
  MongoDbEmbeddedContentStore,
  makeMongoDbEmbeddedContentStore,
} from "mongodb-rag-core";
import { DataSource } from "mongodb-rag-core/dataSources";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import "dotenv/config";
import { doAllCommand } from "./all";
import { makeIngestMetaStore } from "../IngestMetaStore";
import "dotenv/config";
import { strict as assert } from "assert";
import { MongoClient } from "mongodb-rag-core/mongodb";

jest.setTimeout(1000000);

const dataSources: DataSource[] = [];

describe("allCommand", () => {
  const embedder = {
    async embed() {
      return { embedding: [1, 2, 3] };
    },
  };

  let mongod: MongoMemoryReplSet | undefined;
  let mongoClient: MongoClient | undefined;
  let pageStore: PageStore;
  let embedStore: MongoDbEmbeddedContentStore;
  let uri: string;
  let databaseName: string;

  beforeEach(async () => {
    databaseName = "test-all-command";
    mongod = await MongoMemoryReplSet.create();
    uri = mongod.getUri();
    mongoClient = new MongoClient(uri);
    embedStore = makeMongoDbEmbeddedContentStore({
      connectionUri: uri,
      databaseName,
      searchIndex: { embeddingName: "test-embedding" },
    });
    pageStore = makeMongoDbPageStore({
      connectionUri: uri,
      databaseName,
    });
  });

  afterEach(async () => {
    assert(pageStore);
    if (pageStore.close) {
      await pageStore?.close();
    }
    if (embedStore) {
      await embedStore.drop();
      await embedStore.close();
    }
    if (mongod) {
      await mongod.stop();
    }
  });

  it("updates the metadata with the last successful timestamp", async () => {
    const ingestMetaStore = makeIngestMetaStore({
      connectionUri: uri,
      databaseName,
      entryId: "all",
    });
    try {
      let lastSuccessfulRunDate =
        await ingestMetaStore.loadLastSuccessfulRunDate();
      expect(lastSuccessfulRunDate).toBeNull();
      await doAllCommand(
        {
          pageStore: pageStore,
          embeddedContentStore: embedStore,
          ingestMetaStore,
          embedder,
          dataSources,
        },
        {
          async doUpdatePagesCommand() {
            return;
          },
        }
      );
      lastSuccessfulRunDate = await ingestMetaStore.loadLastSuccessfulRunDate();
      expect(lastSuccessfulRunDate?.getTime()).toBeGreaterThan(
        Date.now() - 5000
      );
      expect(lastSuccessfulRunDate?.getTime()).toBeLessThanOrEqual(Date.now());
    } finally {
      await ingestMetaStore.close();
    }
  });

  it("does not update the metadata with the last successful timestamp on failure", async () => {
    const ingestMetaStore = makeIngestMetaStore({
      connectionUri: uri,
      databaseName,
      entryId: "all",
    });
    try {
      let lastSuccessfulRunDate =
        await ingestMetaStore.loadLastSuccessfulRunDate();
      expect(lastSuccessfulRunDate).toBeNull();
      try {
        await doAllCommand(
          {
            pageStore: pageStore,
            embeddedContentStore: embedStore,
            ingestMetaStore,
            embedder,
            dataSources,
          },
          {
            async doUpdatePagesCommand() {
              // Sudden failure!
              throw new Error("Fail!");
            },
          }
        );
      } catch (e: unknown) {
        expect((e as { message: string }).message).toBe("Fail!");
      }
      lastSuccessfulRunDate = await ingestMetaStore.loadLastSuccessfulRunDate();
      // Not updated because run failed
      expect(lastSuccessfulRunDate).toBeNull();
    } finally {
      await ingestMetaStore.close();
    }
  });

  it("cleans up pages and embedded content that are no longer in the data sources", async () => {
    const ingestMetaStore = makeIngestMetaStore({
      connectionUri: uri,
      databaseName,
      entryId: "all",
    });

    // Mock data sources
    const mockDataSources: DataSource[] = [
      { name: "source1", fetchPages: () => Promise.resolve([]) },
      { name: "source2", fetchPages: () => Promise.resolve([]) },
    ];

    // Insert mock pages and embedded content
    assert(mongoClient)
    await mongoClient
      .db(databaseName)
      .collection("pages")
      .insertMany([
        { id: "page1", sourceName: "source1", content: "content1" },
        { id: "page2", sourceName: "source2", content: "content2" },
        { id: "page3", sourceName: "source3", content: "content3" },
      ]);
    await mongoClient
      ?.db(databaseName)
      .collection("embedded_content")
      .insertMany([
        { id: "embed1", sourceName: "source1", embedding: [1, 2, 3] },
        { id: "embed2", sourceName: "source2", embedding: [4, 5, 6] },
        { id: "embed3", sourceName: "source3", embedding: [7, 8, 9] },
      ]);

    try {
      await doAllCommand(
        {
          pageStore: pageStore,
          embeddedContentStore: embedStore,
          ingestMetaStore,
          embedder,
          dataSources: mockDataSources,
        },
        {
          async doUpdatePagesCommand() {
            return;
          },
        }
      );

      const remainingPages = await mongoClient
        .db(databaseName)
        .collection("pages")
        .find()
        .toArray();
      const remainingEmbeddings = await mongoClient
        .db(databaseName)
        .collection("embedded_content")
        .find()
        .toArray();

      expect(remainingPages).toBeDefined();
      expect(remainingPages).toHaveLength(2);
      expect(remainingPages![0].id).toBe("page1");
      expect(remainingPages![1].id).toBe("page2");

      expect(remainingEmbeddings).toBeDefined();
      expect(remainingEmbeddings).toHaveLength(2);
      expect(remainingEmbeddings![0].id).toBe("embed1");
      expect(remainingEmbeddings![1].id).toBe("embed2");
    } finally {
      await ingestMetaStore.close();
      await mongoClient.close();
    }
  });
});
