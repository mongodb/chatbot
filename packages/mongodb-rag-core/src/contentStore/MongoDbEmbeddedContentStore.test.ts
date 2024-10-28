import { strict as assert } from "assert";
import { FindNearestNeighborsOptions } from "../VectorStore";
import { assertEnvVars } from "../assertEnvVars";
import { CORE_ENV_VARS } from "../CoreEnvVars";
import { makeOpenAiEmbedder } from "../embed";
import "dotenv/config";
import { PersistedPage } from "../pageStore";
import { AzureKeyCredential, OpenAIClient } from "@azure/openai";
import {
  MongoDbEmbeddedContentStore,
  makeMongoDbEmbeddedContentStore,
} from "./MongoDbEmbeddedContentStore";

const {
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE_NAME,
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_EMBEDDING_DEPLOYMENT,
  VECTOR_SEARCH_INDEX_NAME,
} = assertEnvVars(CORE_ENV_VARS);

jest.setTimeout(30000);

describe("MongoDbEmbeddedContentStore", () => {
  let store: MongoDbEmbeddedContentStore | undefined;
  beforeEach(async () => {
    // Need to use real Atlas connection in order to run vector searches
    const databaseName = `test-database-${Date.now()}`;
    store = makeMongoDbEmbeddedContentStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName,
    });
  });

  afterEach(async () => {
    assert(store);
    await store.drop();
    await store.close();
  });

  it("handles embedded content", async () => {
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

    const embeddedContent = await store.loadEmbeddedContent({ page });
    expect(embeddedContent).toStrictEqual([]);

    await store.updateEmbeddedContent({
      page,
      embeddedContent: [
        {
          embedding: [],
          sourceName: page.sourceName,
          text: "foo",
          url: page.url,
          tokenCount: 0,
          updated: new Date(),
        },
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
});

describe("nearest neighbor search", () => {
  const embedder = makeOpenAiEmbedder({
    openAiClient: new OpenAIClient(
      OPENAI_ENDPOINT,
      new AzureKeyCredential(OPENAI_API_KEY)
    ),
    deployment: OPENAI_EMBEDDING_DEPLOYMENT,
  });

  const findNearestNeighborOptions: Partial<FindNearestNeighborsOptions> = {
    k: 5,
    path: "embedding",
    indexName: VECTOR_SEARCH_INDEX_NAME,
    minScore: 0.9,
  };

  let store: MongoDbEmbeddedContentStore | undefined;
  beforeEach(async () => {
    // Need to use real Atlas connection in order to run vector searches
    const databaseName = MONGODB_DATABASE_NAME;
    store = makeMongoDbEmbeddedContentStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName,
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
      sourceName: "snooty-docs",
    };

    const { embedding } = await embedder.embed({
      text: query,
    });

    const matches = await store.findNearestNeighbors(embedding, {
      ...findNearestNeighborOptions,
      filter,
    });
    expect(
      matches.filter((match) => match.sourceName !== "snooty-docs")
    ).toHaveLength(0);
  });
  test("Should filter content to not match a non-existent source", async () => {
    assert(store);
    const query = "db.collection.insertOne()";
    const filter = {
      sourceName: { $eq: "not-a-source-name" },
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

  it("does not find nearest neighbors for irrelevant embedding", async () => {
    assert(store);

    const meaninglessEmbedding = new Array(1536).fill(0.1);
    const matches = await store.findNearestNeighbors(
      meaninglessEmbedding,
      findNearestNeighborOptions
    );
    expect(matches).toHaveLength(0);
  });

  it("has an overridable default collection name", async () => {
    assert(store);

    expect(store.metadata.collectionName).toBe("embedded_content");

    const storeWithCustomCollectionName = await makeMongoDbEmbeddedContentStore(
      {
        connectionUri: MONGODB_CONNECTION_URI,
        databaseName: store.metadata.databaseName,
        collectionName: "custom-embedded_content",
      }
    );

    expect(storeWithCustomCollectionName.metadata.collectionName).toBe(
      "custom-embedded_content"
    );
  });
});
