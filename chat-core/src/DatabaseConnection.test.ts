import { stripIndent } from "common-tags";
import { strict as assert } from "assert";
import {
  makeDatabaseConnection,
  DatabaseConnection,
} from "./DatabaseConnection";
import { Page, PageStore, PersistedPage } from "./Page";
import {
  EmbeddedContentStore,
  FindNearestNeighborsOptions,
} from "./EmbeddedContent";
import { assertEnvVars } from "./assertEnvVars";
import { CORE_ENV_VARS } from "./CoreEnvVars";
import { makeOpenAiEmbedFunc } from "./OpenAiEmbedFunc";
import "dotenv/config";

const {
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE_NAME,
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_EMBEDDING_DEPLOYMENT,
  OPENAI_EMBEDDING_MODEL_VERSION,
  VECTOR_SEARCH_INDEX_NAME,
} = assertEnvVars(CORE_ENV_VARS);

describe("DatabaseConnection", () => {
  let store:
    | (DatabaseConnection & PageStore & EmbeddedContentStore)
    | undefined;
  beforeEach(async () => {
    // Need to use real Atlas connection in order to run vector searches
    const databaseName = `test-database-${Date.now()}`;
    store = await makeDatabaseConnection({
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
      tags: [],
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
        tags: [],
        updated: new Date("1999-03-31"),
        url: "matrix1",
      },
      {
        action: "created",
        body: "The Matrix: Reloaded (2003) comes out",
        format: "md",
        sourceName: "",
        tags: [],
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
});

describe("nearest neighbor search", () => {
  const embed = makeOpenAiEmbedFunc({
    baseUrl: OPENAI_ENDPOINT,
    apiKey: OPENAI_API_KEY,
    apiVersion: OPENAI_EMBEDDING_MODEL_VERSION,
    deployment: OPENAI_EMBEDDING_DEPLOYMENT,
  });

  const findNearestNeighborOptions: FindNearestNeighborsOptions = {
    k: 5,
    path: "embedding",
    indexName: VECTOR_SEARCH_INDEX_NAME,
    minScore: 0.9,
  };

  let store:
    | (DatabaseConnection & PageStore & EmbeddedContentStore)
    | undefined;
  beforeEach(async () => {
    // Need to use real Atlas connection in order to run vector searches
    const databaseName = MONGODB_DATABASE_NAME;
    store = await makeDatabaseConnection({
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
    const { embedding } = await embed({
      text: query,
      userIp: "XYZ",
    });

    // Confirm that we are loading the correct sample data
    expect(
      await store.loadEmbeddedContent({
        page: {
          url: "https://mongodb.com/developer/products/realm/build-ci-cd-pipelines-realm-apps-github-actions",
          sourceName: "dev-center",
        } as Page,
      })
    ).toHaveLength(29);

    const matches = await store.findNearestNeighbors(
      embedding,
      findNearestNeighborOptions
    );
    expect(matches).toHaveLength(5);
  });

  it("does not find nearest neighbors for irrelevant query", async () => {
    assert(store);
    // taken from https://en.wikipedia.org/wiki/Egg_as_food
    const query = stripIndent`Humans and human ancestors have scavenged and eaten animal eggs for millions of years.[1] Humans in Southeast Asia had domesticated chickens and harvested their eggs for food by 1500 BCE.[2] The most widely consumed eggs are those of fowl, especially chickens. Eggs of other birds, including ostriches and other ratites, are eaten regularly but much less commonly than those of chickens. People may also eat the eggs of reptiles, amphibians, and fish. Fish eggs consumed as food are known as roe or caviar.

    Bird and reptile eggs consist of a protective eggshell, albumen (egg white), and vitellus (egg yolk), contained within various thin membranes. Egg yolks and whole eggs store significant amounts of protein and choline,[3][4] and are widely used in cookery. Due to their protein content, the United States Department of Agriculture formerly categorized eggs as Meat within the Food Guide Pyramid (now MyPlate).[3] Despite the nutritional value of eggs, there are some potential health issues arising from cholesterol content, salmonella contamination, and allergy to egg proteins.

    Chickens and other egg-laying creatures are kept widely throughout the world and mass production of chicken eggs is a global industry. In 2009, an estimated 62.1 million metric tons of eggs were produced worldwide from a total laying flock of approximately 6.4 billion hens.[5] There are issues of regional variation in demand and expectation, as well as current debates concerning methods of mass production. In 2012, the European Union banned battery husbandry of chickens.`;
    const { embedding } = await embed({
      text: query,
      userIp: "XYZ",
    });
    const matches = await store.findNearestNeighbors(
      embedding,
      findNearestNeighborOptions
    );
    expect(matches).toHaveLength(0);
  });
});
