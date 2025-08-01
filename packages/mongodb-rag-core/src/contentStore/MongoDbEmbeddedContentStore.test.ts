import { strict as assert } from "assert";
import { AzureOpenAI } from "openai";
import { FindNearestNeighborsOptions } from "../VectorStore";
import { assertEnvVars } from "../assertEnvVars";
import { CORE_ENV_VARS } from "../CoreEnvVars";
import { makeOpenAiEmbedder } from "../embed";
import "dotenv/config";
import { PersistedPage } from ".";
import {
  MongoDbEmbeddedContentStore,
  listDataSourcesCache,
  makeMongoDbEmbeddedContentStore,
} from "./MongoDbEmbeddedContentStore";
import { MongoClient } from "mongodb";
import { EmbeddedContent } from "./EmbeddedContent";
import { MONGO_MEMORY_REPLICA_SET_URI, MONGO_MEMORY_SERVER_URI } from "../test/constants";

const {
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE_NAME,
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
  VECTOR_SEARCH_INDEX_NAME,
  OPENAI_API_VERSION,
} = assertEnvVars(CORE_ENV_VARS);

jest.setTimeout(30000);

describe("MongoDbEmbeddedContentStore", () => {
  let store: MongoDbEmbeddedContentStore | undefined;
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
  const anotherPage: PersistedPage = {
    action: "created",
    body: "bar",
    format: "md",
    sourceName: "another-source",
    metadata: {
      tags: [],
    },
    updated: new Date(),
    url: "/a/b/c",
  };
  const pages = [page, anotherPage];
  const uri = MONGO_MEMORY_REPLICA_SET_URI;

  beforeAll(async () => {
    store = makeMongoDbEmbeddedContentStore({
      connectionUri: uri,
      databaseName: "test-database",
      searchIndex: {
        embeddingName: OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
      },
    });
  });
  beforeEach(async () => {
    for (const page of pages) {
      await store?.updateEmbeddedContent({
        page,
        embeddedContent: [
          {
            embeddings: {
              [store.metadata.embeddingName]: new Array(1536).fill(0.1),
            },
            sourceName: page.sourceName,
            text: page.body,
            url: page.url,
            tokenCount: 0,
            updated: new Date(),
          },
        ],
      });
    }
  });

  afterEach(async () => {
    await store?.drop();
  });
  afterAll(async () => {
    await store?.close();
  });

  it("has an overridable default collection name", async () => {
    assert(store);

    expect(store.metadata.collectionName).toBe("embedded_content");

    const storeWithCustomCollectionName = await makeMongoDbEmbeddedContentStore(
      {
        connectionUri: MONGODB_CONNECTION_URI,
        databaseName: store.metadata.databaseName,
        collectionName: "custom-embedded_content",
        searchIndex: {
          embeddingName: "ada-02",
        },
      }
    );

    expect(storeWithCustomCollectionName.metadata.collectionName).toBe(
      "custom-embedded_content"
    );
  });
  describe("loadEmbeddedContent", () => {
    it("loads embedded content belonging to the page provided", async () => {
      assert(store);
      const pageEmbeddings = await store.loadEmbeddedContent({ page });
      const anotherPageEmbeddings = await store.loadEmbeddedContent({
        page: anotherPage,
      });
      expect(pageEmbeddings[0].sourceName).toBe(page.sourceName);
      expect(anotherPageEmbeddings[0].sourceName).toBe(anotherPage.sourceName);
    });
    it("does NOT load embedded content for some other page", async () => {
      assert(store);
      expect(
        await store.loadEmbeddedContent({
          page: { ...page, sourceName: "source3" },
        })
      ).toStrictEqual([]);
      expect(
        await store.loadEmbeddedContent({
          page: { ...page, url: page.url + "/" },
        })
      ).toStrictEqual([]);
    });
  });
  describe("updateEmbeddedContent", () => {
    it("replaces existing embedded content belonging to the page provided with the new embedded content array provided", async () => {
      assert(store);
      const originalPageEmbedding = await store.loadEmbeddedContent({ page });
      assert(originalPageEmbedding.length === 1);

      const newEmbeddings = [{ ...originalPageEmbedding[0], text: "new text" }];
      await store.updateEmbeddedContent({
        page,
        embeddedContent: newEmbeddings,
      });

      const pageEmbeddings = await store.loadEmbeddedContent({ page });
      expect(pageEmbeddings.length).toBe(1);
      expect(pageEmbeddings[0].text).toBe("new text");
    });
  });
  describe("deleteEmbeddedContent", () => {
    it("deletes embedded content for a page", async () => {
      assert(store);

      await store.deleteEmbeddedContent({ page });

      expect(await store.loadEmbeddedContent({ page })).toStrictEqual([]);
      // Won't delete another page's embedded content
      expect(
        (await store.loadEmbeddedContent({ page: anotherPage })).length
      ).toBe(1);
    });
    it("deletes embedded content for data sources specified", async () => {
      assert(store);

      await store.deleteEmbeddedContent({ dataSources: [page.sourceName] });

      expect(await store.loadEmbeddedContent({ page })).toStrictEqual([]);
      // Won't delete embedded content of another data source
      const remainingEmbeddedContent = await store.loadEmbeddedContent({
        page: anotherPage,
      });
      expect(remainingEmbeddedContent.length).toBe(1);
      expect(remainingEmbeddedContent[0].sourceName).toBe(
        anotherPage.sourceName
      );
    });
    it("deletes embedded content for all data sources NOT specified", async () => {
      assert(store);

      await store.deleteEmbeddedContent({
        dataSources: [page.sourceName],
        inverseDataSources: true,
      });

      expect(
        await store.loadEmbeddedContent({ page: anotherPage })
      ).toStrictEqual([]);
      // Won't delete embedded content for provided data source
      const remainingEmbeddedContent = await store.loadEmbeddedContent({
        page,
      });
      expect(remainingEmbeddedContent.length).toBe(1);
      expect(remainingEmbeddedContent[0].sourceName).toBe(page.sourceName);
    });
  });
});

describe("nearest neighbor search", () => {
  const embedder = makeOpenAiEmbedder({
    openAiClient: new AzureOpenAI({
      apiKey: OPENAI_API_KEY,
      endpoint: OPENAI_ENDPOINT,
      apiVersion: OPENAI_API_VERSION,
    }),
    deployment: OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
  });

  const findNearestNeighborOptions: Partial<FindNearestNeighborsOptions> = {
    k: 5,
    indexName: VECTOR_SEARCH_INDEX_NAME,
    minScore: 0.7,
  };

  let store: MongoDbEmbeddedContentStore | undefined;
  beforeEach(async () => {
    // Need to use real Atlas connection in order to run vector searches
    store = makeMongoDbEmbeddedContentStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_DATABASE_NAME,
      searchIndex: {
        embeddingName: OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
      },
    });
  });

  afterEach(async () => {
    assert(store);
    await store.close();
  });

  it("successfully finds nearest neighbors for relevant query", async () => {
    assert(store);

    const query = "Connect to MongoDB with Node.js";
    const { embedding } = await embedder.embed({
      text: query,
    });

    const matches = await store.findNearestNeighbors(
      embedding,
      findNearestNeighborOptions
    );
    expect(matches).toHaveLength(5);
  });

  test("Should filter content to only match specific sourceName", async () => {
    assert(store);
    const query = "db.collection.insertOne()";
    const filter = {
      sourceName: "docs",
    };

    const { embedding } = await embedder.embed({
      text: query,
    });

    const matches = await store.findNearestNeighbors(embedding, {
      ...findNearestNeighborOptions,
      filter,
    });
    expect(matches.filter((match) => match.sourceName !== "docs")).toHaveLength(
      0
    );
  });

  test("Should filter content to not match a non-existent source", async () => {
    assert(store);
    const query = "db.collection.insertOne()";
    const filter = {
      sourceName: "not-a-source-name",
    };
    const { embedding } = await embedder.embed({
      text: query,
    });

    const noMatches = await store.findNearestNeighbors(embedding, {
      ...findNearestNeighborOptions,
      filter,
    });
    expect(noMatches).toHaveLength(0);
    // Validate that search works on same query for all sources
    const matches = await store.findNearestNeighbors(
      embedding,
      findNearestNeighborOptions
    );
    expect(matches.length).toBeGreaterThan(0);
  });

  it("Should filter content to current version by default", async () => {
    assert(store);
    const query = "db.collection.insertOne()";
    const filter = {
      sourceName: "docs",
    };
    const { embedding } = await embedder.embed({
      text: query,
    });

    const matches = await store.findNearestNeighbors(embedding, {
      ...findNearestNeighborOptions,
      filter,
    });

    expect(
      matches.filter((match) => match.metadata?.version?.isCurrent !== true)
    ).toHaveLength(0);
    expect(
      matches.filter((match) => match.metadata?.version?.isCurrent === true)
    ).toHaveLength(5);
  });

  it("Should filter content to version requested", async () => {
    assert(store);
    const query = "db.collection.insertOne()";
    const filter = {
      sourceName: "docs",
      version: { label: "7.0" },
    };
    const { embedding } = await embedder.embed({
      text: query,
    });

    const matches = await store.findNearestNeighbors(embedding, {
      ...findNearestNeighborOptions,
      filter,
    });
    expect(
      matches.filter((match) => match.metadata?.version?.label !== "7.0")
    ).toHaveLength(0);
    expect(
      matches.filter((match) => match.metadata?.version?.label === "7.0")
    ).toHaveLength(5);
  });

  it("Should be able to handle content that is not versioned", async () => {
    assert(store);
    const query = "tell me about MongoDB";
    const filter = {
      sourceName: "blog", // blog is not versioned
    };
    const { embedding } = await embedder.embed({
      text: query,
    });

    const matches = await store.findNearestNeighbors(embedding, {
      ...findNearestNeighborOptions,
      filter,
    });

    expect(
      matches.filter((match) => match.metadata?.version === undefined)
    ).toHaveLength(5);
  });

  it("Should filter content to sourceType requested", async () => {
    assert(store);
    const query = "db.collection.insertOne()";
    const filter = {
      sourceType: "tech-docs",
    };
    const { embedding } = await embedder.embed({
      text: query,
    });

    const matches = await store.findNearestNeighbors(embedding, {
      ...findNearestNeighborOptions,
      filter,
    });
    expect(
      matches.filter((match) => match.sourceType === "tech-docs")
    ).toHaveLength(5);
  });

  it("does not find nearest neighbors for irrelevant embedding", async () => {
    assert(store);

    const meaninglessEmbedding = new Array(1536).fill(0.0001);
    const matches = await store.findNearestNeighbors(
      meaninglessEmbedding,
      findNearestNeighborOptions
    );
    expect(matches).toHaveLength(0);
  });
});

describe("initialized DB", () => {
  let store: MongoDbEmbeddedContentStore | undefined;
  let mongoClient: MongoClient | undefined;
  type VectorSearchIndex = {
    statusDetail: any;
    latestDefinition: {
      fields: any[];
    };
    latestDefinitionVersion: { version: number; createdAt: Date };
    name: string;
    type: string;
  };
  beforeEach(async () => {
    // Need to use real Atlas connection in order to run vector searches
    store = makeMongoDbEmbeddedContentStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_DATABASE_NAME,
      searchIndex: {
        embeddingName: OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
        filters: [
          { type: "filter", path: "sourceName" },
          { type: "filter", path: "metadata.version.label" },
          { type: "filter", path: "metadata.version.isCurrent" },
        ],
        name: VECTOR_SEARCH_INDEX_NAME,
      },
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
      .collection<EmbeddedContent>(store.metadata.collectionName);
    const indexes = await coll?.listIndexes().toArray();
    expect(indexes?.some((el) => el.name === "_id_")).toBe(true);
    expect(indexes?.some((el) => el.name === "sourceName_1")).toBe(true);
    expect(indexes?.some((el) => el.name === "url_1")).toBe(true);
    expect(
      indexes?.some((el) => el.name === "metadata.version.isCurrent_1")
    ).toBe(true);
    expect(indexes?.some((el) => el.name === "metadata.version.label_1")).toBe(
      true
    );
    expect(indexes?.some((el) => el.name === "sourceType_1")).toBe(true);

    const vectorIndexes = await coll?.listSearchIndexes().toArray();
    if (!vectorIndexes) return;

    expect(
      vectorIndexes?.some(
        (vi) => (vi as VectorSearchIndex).type === "vectorSearch"
      )
    ).toBe(true);

    const vectorSearchIndex = vectorIndexes?.find(
      (vi) => vi.name === VECTOR_SEARCH_INDEX_NAME
    ) as VectorSearchIndex;

    const filterPaths = vectorSearchIndex.latestDefinition.fields
      .filter((field: { type: string }) => field.type === "filter")
      .map((field: { path: any }) => field.path);
    expect(filterPaths).toContain("sourceName");
    expect(filterPaths).toContain("metadata.version.label");
    expect(filterPaths).toContain("metadata.version.isCurrent");
    expect(filterPaths).toContain("sourceType");
  });
});

describe("listDataSources", () => {
  let store: MongoDbEmbeddedContentStore | undefined;
  let mongoClient: MongoClient | undefined;
  let dateNowSpy: jest.SpyInstance;

  beforeAll(() => {
    dateNowSpy = jest.spyOn(Date, "now");
  });

  afterAll(() => {
    dateNowSpy.mockRestore();
  });

  beforeEach(async () => {
    store = makeMongoDbEmbeddedContentStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_DATABASE_NAME,
      collectionName: "test-list-data-sources-collection",
      searchIndex: { embeddingName: "test-list-data-sources" },
    });
    mongoClient = new MongoClient(MONGODB_CONNECTION_URI);

    listDataSourcesCache.data = null;
    listDataSourcesCache.expiresAt = 0;
    listDataSourcesCache.isRefreshing = false;
    dateNowSpy.mockReset();
  });

  afterEach(async () => {
    assert(store);
    assert(mongoClient);
    await store.close();
    await mongoClient.close();
  });

  it("returns grouped data sources with correct versions and type", async () => {
    const docs: EmbeddedContent[] = [
      {
        sourceName: "solutions",
        url: "/foo",
        text: "foo",
        tokenCount: 1,
        embeddings: { test: [0.1] },
        updated: new Date(),
        sourceType: "docs",
        metadata: { version: { label: "v1.0", isCurrent: true } },
      },
      {
        sourceName: "solutions",
        url: "/bar",
        text: "bar",
        tokenCount: 1,
        embeddings: { test: [0.2] },
        updated: new Date(),
        sourceType: "docs",
        metadata: { version: { label: "v2.0", isCurrent: false } },
      },
      {
        sourceName: "mongodb-university",
        url: "/baz",
        text: "baz",
        tokenCount: 1,
        embeddings: { test: [0.3] },
        updated: new Date(),
        sourceType: "web",
        metadata: { version: { label: "v1.0", isCurrent: false } },
      },
      {
        sourceName: "mongoid",
        url: "/boop",
        text: "boop",
        tokenCount: 1,
        embeddings: { test: [0.4] },
        updated: new Date(),
        sourceType: "blog",
        metadata: {}, // no version
      },
    ];

    assert(store);
    await store.init();

    const coll = mongoClient
      ?.db(store.metadata.databaseName)
      .collection<EmbeddedContent>(store.metadata.collectionName);
    await coll?.insertMany(docs);

    const result = await store!.listDataSources();
    expect(Array.isArray(result)).toBe(true);

    // solutions should have two versions
    const sourceA = result.find((ds) => ds.id === "solutions");
    expect(sourceA).toBeDefined();
    expect(sourceA!.type).toBe("docs");
    expect(sourceA!.versions).toEqual(
      expect.arrayContaining([
        { label: "v1.0", isCurrent: true },
        { label: "v2.0", isCurrent: false },
      ])
    );
    // mongodb-university should have one version
    const sourceB = result.find((ds) => ds.id === "mongodb-university");
    expect(sourceB).toBeDefined();
    expect(sourceB!.type).toBe("web");
    expect(sourceB!.versions).toEqual([{ label: "v1.0", isCurrent: false }]);
    // mongoid should have empty versions array
    const sourceC = result.find((ds) => ds.id === "mongoid");
    expect(sourceC).toBeDefined();
    expect(sourceC!.type).toBe("blog");
    expect(sourceC!.versions).toEqual([]);
  });

  it("returns cached data if cache is fresh (<24hrs)", async () => {
    const now = 1720000000000;
    dateNowSpy.mockImplementation(() => now);

    const mockCachedData = [{ id: "name1" }];
    listDataSourcesCache.data = mockCachedData;
    listDataSourcesCache.expiresAt = now + 1000 * 60 * 60 * 12; // 12 hrs later

    assert(store);
    const result = await store.listDataSources();
    expect(result).toBe(mockCachedData);
  });

  it("returns stale data and triggers background refresh if cache is >24hrs but <7d", async () => {
    const now = 1720000000000;
    dateNowSpy.mockImplementation(() => now);

    const staleData = [{ id: "name2" }];
    listDataSourcesCache.data = staleData;
    listDataSourcesCache.expiresAt = now - 1000; // 1 sec ago

    assert(store);
    const result = await store.listDataSources();

    expect(result).toBe(staleData); // Still returns stale
    expect(listDataSourcesCache.isRefreshing).toBe(true); // Refresh triggered
  });

  it("blocks and fetches fresh data if cache is >7d", async () => {
    const now = 1720000000000;
    dateNowSpy.mockImplementation(() => now);

    listDataSourcesCache.data = null;
    listDataSourcesCache.expiresAt = now - 1000 * 60 * 60 * 24 * 8; // 8 days ago

    assert(store);

    // Insert real data into the collection so it can be fetched fresh
    const coll = mongoClient
      ?.db(store.metadata.databaseName)
      .collection<EmbeddedContent>(store.metadata.collectionName);
    await coll?.deleteMany({});
    await coll?.insertOne({
      sourceName: "docs",
      url: "/test",
      text: "text",
      tokenCount: 1,
      embeddings: { test: [0.1] },
      updated: new Date(),
      sourceType: "docs",
      metadata: { version: { label: "v12.0", isCurrent: true } },
    });

    const result = await store.listDataSources();
    expect(result.length).toBeGreaterThan(0); // Real fetch happened
    expect(result).toStrictEqual([{ id: "docs", versions: [{ label: "v12.0", isCurrent: true }], type: "docs" }])
  });
});