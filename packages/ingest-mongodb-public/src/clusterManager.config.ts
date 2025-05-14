import { Config, makeIngestMetaStore } from "mongodb-rag-ingest";
import { standardChunkFrontMatterUpdater } from "mongodb-rag-core";
import {
  assertEnvVars,
  makeOpenAiEmbedder,
  makeMongoDbEmbeddedContentStore,
  makeMongoDbPageStore,
  filterFulfilled,
} from "mongodb-rag-core";
import { AzureOpenAI } from "mongodb-rag-core/openai";
import { sourceConstructors } from "./sources";
import assert from "assert";

const {
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_API_VERSION,
  OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
  MONGODB_CONNECTION_URI,
} = assertEnvVars({
  OPENAI_ENDPOINT: "",
  OPENAI_API_KEY: "",
  OPENAI_API_VERSION: "",
  OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT: "",
  MONGODB_CONNECTION_URI: "",
});

const embedder = makeOpenAiEmbedder({
  openAiClient: new AzureOpenAI({
    apiKey: OPENAI_API_KEY,
    endpoint: OPENAI_ENDPOINT,
    apiVersion: OPENAI_API_VERSION,
  }),
  deployment: OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
  backoffOptions: {
    numOfAttempts: 25,
    startingDelay: 1000,
  },
});

export const standardConfig = {
  embedder: () => embedder,
  embeddedContentStore: () =>
    makeMongoDbEmbeddedContentStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: "cluster-manager",
      collectionName: process.env.MONGODB_EMBEDDED_CONTENT_COLLECTION_NAME,
      searchIndex: {
        embeddingName: OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
        name: OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
      },
    }),
  pageStore: () =>
    makeMongoDbPageStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: "cluster-manager",
    }),
  ingestMetaStore: () =>
    makeIngestMetaStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: "cluster-manager",
      entryId: "all",
    }),
  chunkOptions: () => ({
    transform: standardChunkFrontMatterUpdater,
  }),
  concurrencyOptions: () => ({
    embed: {
      createChunks: 5,
    },
  }),
  dataSources: async () => {
    const allSources = await filterFulfilled(
      await Promise.allSettled(
        sourceConstructors.map((constructor) => constructor())
      )
    )
      .map(({ value }) => value)
      .flat(1);

    const atlasDocs = allSources.find((s) => s.name === "snooty-cloud-docs");
    assert(atlasDocs, "snooty-cloud-docs data source not found");
    // Store the original fetchPages method
    const originalFetchPages = atlasDocs.fetchPages;
    // Override with a new implementation that calls the original
    atlasDocs.fetchPages = async function () {
      const urls = [
        "https://mongodb.com/docs/atlas/architecture/current/hierarchy/",
        "https://mongodb.com/docs/atlas/sizing-tier-selection/",
        "https://mongodb.com/docs/atlas/create-database-deployment/",
        "https://mongodb.com/docs/atlas/reference/google-gcp/",
        "https://mongodb.com/docs/atlas/reference/amazon-aws/",
        "https://mongodb.com/docs/atlas/reference/microsoft-azure/",
        "https://mongodb.com/docs/atlas/cluster-config/multi-cloud-distribution/",
        "https://mongodb.com/docs/atlas/global-clusters/",
        "https://mongodb.com/docs/atlas/tutorial/create-global-cluster/",
        "https://mongodb.com/docs/atlas/billing/cluster-configuration-costs/#cluster-configuration-costs",
        "https://mongodb.com/docs/atlas/architecture/current/scalability/",
        "https://mongodb.com/docs/atlas/cluster-autoscaling/",
        "https://mongodb.com/docs/atlas/reference/flex-limitations/",
      ];

      // Call the original method, not the overridden one
      const pages = await originalFetchPages.call(atlasDocs);
      return pages.filter((p) => urls.includes(p.url));
    };
    return [atlasDocs];
  },
} satisfies Config;

export default standardConfig;
