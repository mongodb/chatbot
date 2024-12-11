import {
  PageStore,
  makeMongoDbPageStore,
  MongoDbEmbeddedContentStore,
  makeMongoDbEmbeddedContentStore,
  updatePages,
  updateEmbeddedContent,
} from "mongodb-rag-core";
import { DataSource } from "mongodb-rag-core/dataSources";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import "dotenv/config";
import { doAllCommand } from "./all";
import { makeIngestMetaStore } from "../IngestMetaStore";
import "dotenv/config";
import { strict as assert } from "assert";
import { MongoClient } from "mongodb-rag-core/mongodb";
import { doUpdatePagesCommand } from "./pages";

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

  it("deletes pages and embedded content that are no longer in the data sources", async () => {
    const ingestMetaStore = makeIngestMetaStore({
      connectionUri: uri,
      databaseName,
      entryId: "all",
    });
    assert(mongoClient);

    // Mock data sources
    const mockDataSources: DataSource[] = [
      {
        name: "source1",
        fetchPages: async () => [
          {
            url: "test1.com",
            format: "html",
            sourceName: "source1",
            body: "hello source 1",
          },
        ],
      },
      {
        name: "source2",
        fetchPages: async () => [
          {
            url: "test2.com",
            format: "html",
            sourceName: "source2",
            body: "hello source 1",
          },
        ],
      },
    ];
    const mockDataSourceNames = mockDataSources.map(
      (dataSource) => dataSource.name
    );

    try {
      // Start Setup
      // create pages and verify that they have been created
      await updatePages({ sources: mockDataSources, pageStore });
      const pages = await pageStore.loadPages();
      assert(pages.length == 2);
      // create embeddings for the pages and verify that they have been created
      await updateEmbeddedContent({
        since: new Date(0),
        embeddedContentStore: embedStore,
        pageStore,
        sourceNames: mockDataSourceNames,
        embedder,
      });
      let page1Embedding = await embedStore.loadEmbeddedContent({
        page: pages[0],
      });
      let page2Embedding = await embedStore.loadEmbeddedContent({
        page: pages[1],
      });
      assert(page1Embedding.length);
      assert(page2Embedding.length);
      // End Setup

      // run the all command with only one data source and verify that the page and embedding from the other data source are deleted
      const remainingDataSources = mockDataSources.slice(0, 1);
      const remainingDataSourcesNames = remainingDataSources.map(
        (dataSource) => dataSource.name
      );
      await doAllCommand(
        {
          pageStore: pageStore,
          embeddedContentStore: embedStore,
          ingestMetaStore,
          embedder,
          dataSources: remainingDataSources,
        },
        {
          async doUpdatePagesCommand() {
            await doUpdatePagesCommand(
              {
                pageStore,
                dataSources: remainingDataSources,
                ingestMetaStore,
                embeddedContentStore: embedStore,
                embedder,
              },
              { source: remainingDataSourcesNames }
            );
          },
        }
      );

      const remainingPages = await pageStore.loadPages();
      expect(remainingPages).toHaveLength(1);
      expect(remainingPages![0].sourceName).toBe(remainingDataSourcesNames[0]);

      page1Embedding = await embedStore.loadEmbeddedContent({ page: pages[0] });
      page2Embedding = await embedStore.loadEmbeddedContent({ page: pages[1] });
      expect(page1Embedding).toBeDefined();
      expect(page1Embedding[0].sourceName).toBe(remainingDataSourcesNames[0]);
      expect(page2Embedding).toEqual([]);
    } finally {
      await ingestMetaStore.close();
      await mongoClient.close();
    }
  });
});
