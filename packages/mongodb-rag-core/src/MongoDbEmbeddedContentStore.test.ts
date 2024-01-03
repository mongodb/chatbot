import { stripIndent } from "common-tags";
import { strict as assert } from "assert";
import { DatabaseConnection } from "./DatabaseConnection";
import {
  EmbeddedContentStore,
  FindNearestNeighborsOptions,
} from "./EmbeddedContent";
import { makeMongoDbEmbeddedContentStore } from "./MongoDbEmbeddedContentStore";
import { assertEnvVars } from "./assertEnvVars";
import { CORE_ENV_VARS } from "./CoreEnvVars";
import { makeOpenAiEmbedder } from "./OpenAiEmbedder";
import "dotenv/config";
import { PersistedPage } from "./Page";
import { AzureKeyCredential, OpenAIClient } from "@azure/openai";

const {
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE_NAME,
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_EMBEDDING_DEPLOYMENT,
  VECTOR_SEARCH_INDEX_NAME,
} = assertEnvVars(CORE_ENV_VARS);

describe("MongoDbEmbeddedContentStore", () => {
  let store: (DatabaseConnection & EmbeddedContentStore) | undefined;
  beforeEach(async () => {
    // Need to use real Atlas connection in order to run vector searches
    const databaseName = `test-database-${Date.now()}`;
    store = await makeMongoDbEmbeddedContentStore({
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

  let store: (DatabaseConnection & EmbeddedContentStore) | undefined;
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

  it("does not find nearest neighbors for irrelevant query", async () => {
    assert(store);
    // taken from https://en.wikipedia.org/wiki/Egg_as_food
    const query = stripIndent`Humans and human ancestors have scavenged and eaten animal eggs for millions of years.[1] Humans in Southeast Asia had domesticated chickens and harvested their eggs for food by 1500 BCE.[2] The most widely consumed eggs are those of fowl, especially chickens. Eggs of other birds, including ostriches and other ratites, are eaten regularly but much less commonly than those of chickens. People may also eat the eggs of reptiles, amphibians, and fish. Fish eggs consumed as food are known as roe or caviar.

    Bird and reptile eggs consist of a protective eggshell, albumen (egg white), and vitellus (egg yolk), contained within various thin membranes. Egg yolks and whole eggs store significant amounts of protein and choline,[3][4] and are widely used in cookery. Due to their protein content, the United States Department of Agriculture formerly categorized eggs as Meat within the Food Guide Pyramid (now MyPlate).[3] Despite the nutritional value of eggs, there are some potential health issues arising from cholesterol content, salmonella contamination, and allergy to egg proteins.

    Chickens and other egg-laying creatures are kept widely throughout the world and mass production of chicken eggs is a global industry. In 2009, an estimated 62.1 million metric tons of eggs were produced worldwide from a total laying flock of approximately 6.4 billion hens.[5] There are issues of regional variation in demand and expectation, as well as current debates concerning methods of mass production. In 2012, the European Union banned battery husbandry of chickens.`;
    const { embedding } = await embedder.embed({
      text: query,
    });
    const matches = await store.findNearestNeighbors(
      embedding,
      findNearestNeighborOptions
    );
    expect(matches).toHaveLength(0);
  });
});
