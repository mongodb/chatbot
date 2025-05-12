import {
  makeMongoDbPageStore,
  MongoDbEmbeddedContentStore,
  makeMongoDbEmbeddedContentStore,
  updatePages,
  updateEmbeddedContent,
  MongoDbPageStore,
  PersistedPage,
} from "mongodb-rag-core";
import { DataSource } from "mongodb-rag-core/dataSources";
import "dotenv/config";
import { doAllCommand } from "./all";
import { IngestMetaStore, makeIngestMetaStore } from "../IngestMetaStore";
import "dotenv/config";
import { strict as assert } from "assert";
import { doUpdatePagesCommand } from "./pages";
import { MONGO_MEMORY_REPLICA_SET_URI } from "../test/constants";

jest.setTimeout(1000000);

const dataSources: DataSource[] = [];

describe("allCommand", () => {
  const embedder = {
    async embed() {
      return { embedding: [1, 2, 3] };
    },
  };

  let pageStore: MongoDbPageStore;
  let embedStore: MongoDbEmbeddedContentStore;
  let ingestMetaStore: IngestMetaStore;
  let uri: string;
  let databaseName: string;
  let page1Embedding, page2Embedding;
  let pages: PersistedPage[] = [];

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
  beforeAll(async () => {
    databaseName = "test-all-command";
    uri = MONGO_MEMORY_REPLICA_SET_URI;
    embedStore = makeMongoDbEmbeddedContentStore({
      connectionUri: uri,
      databaseName,
      searchIndex: { embeddingName: "test-embedding" },
    });
    pageStore = makeMongoDbPageStore({
      connectionUri: uri,
      databaseName,
    });
    ingestMetaStore = makeIngestMetaStore({
      connectionUri: uri,
      databaseName,
      entryId: "all",
    });
  });
  beforeEach(async () => {
    // create pages and verify that they have been created
    await updatePages({ sources: mockDataSources, pageStore });
    pages = await pageStore.loadPages();
    assert(pages.length == 2);
    // create embeddings for the pages and verify that they have been created
    await updateEmbeddedContent({
      since: new Date(0),
      embeddedContentStore: embedStore,
      pageStore,
      sourceNames: mockDataSourceNames,
      embedder,
    });
    page1Embedding = await embedStore.loadEmbeddedContent({
      page: pages[0],
    });
    page2Embedding = await embedStore.loadEmbeddedContent({
      page: pages[1],
    });
    assert(page1Embedding.length);
    assert(page2Embedding.length);
  });

  afterEach(async () => {
    await pageStore?.drop();
    await embedStore.drop();
  });
  afterAll(async () => {
    await pageStore?.close();
    await embedStore.close();
  });

  it("updates the metadata with the last successful timestamp", async () => {
    let lastSuccessfulRunDate =
      await ingestMetaStore.loadLastSuccessfulRunDate();
    expect(lastSuccessfulRunDate).toBeNull();
    await doAllCommand(
      {
        pageStore,
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
    expect(lastSuccessfulRunDate?.getTime()).toBeGreaterThan(Date.now() - 5000);
    expect(lastSuccessfulRunDate?.getTime()).toBeLessThanOrEqual(Date.now());
  });

  it("does not update the metadata with the last successful timestamp on failure", async () => {
    let lastSuccessfulRunDate =
      await ingestMetaStore.loadLastSuccessfulRunDate();
    expect(lastSuccessfulRunDate).toBeNull();
    try {
      await doAllCommand(
        {
          pageStore,
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
  });

  it("deletes pages and embedded content that are no longer in the data sources", async () => {
    // run the all command with only one data source and verify that the page and embedding from the other data source are deleted
    const remainingDataSources = mockDataSources.slice(0, 1);
    const remainingDataSourcesNames = remainingDataSources.map(
      (dataSource) => dataSource.name
    );
    await doAllCommand(
      {
        pageStore,
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

    const [page1, page2] = await pageStore.loadPages();
    expect(page1).toMatchObject({
      url: "test1.com",
      sourceName: "source1",
      action: "created",
    });
    expect(page2).toMatchObject({
      url: "test2.com",
      sourceName: "source2",
      action: "deleted",
    });
    page1Embedding = await embedStore.loadEmbeddedContent({ page: pages[0] });
    page2Embedding = await embedStore.loadEmbeddedContent({ page: pages[1] });
    expect(page1Embedding).toBeDefined();
    expect(page1Embedding[0].sourceName).toBe(remainingDataSourcesNames[0]);
    expect(page1Embedding).toMatchObject([
      {
        url: "test1.com",
        sourceName: "source1",
      },
    ]);
    expect(page2Embedding).toEqual([]);
  });
});
