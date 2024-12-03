import { Config, makeIngestMetaStore } from "mongodb-rag-ingest";
import { standardChunkFrontMatterUpdater } from "mongodb-rag-core";
import {
  assertEnvVars,
  makeOpenAiEmbedder,
  makeMongoDbEmbeddedContentStore,
  makeMongoDbPageStore,
} from "mongodb-rag-core";
import { AzureOpenAI } from "mongodb-rag-core/openai";
import { makeSnootyDataSource } from "./sources/snooty";
import {
  PUBLIC_INGEST_ENV_VARS,
  PUBLIC_INGEST_MONGODB_DOCS_META_ENV_VARS,
} from "./PublicIngestEnvVars";
import { snootyDataApiBaseUrl } from "./sources/snootySources";

const {
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_API_VERSION,
  OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
  MONGODB_CONNECTION_URI,
  MONGODB_META_DATABASE_NAME,
} = assertEnvVars({
  ...PUBLIC_INGEST_ENV_VARS,
  ...PUBLIC_INGEST_MONGODB_DOCS_META_ENV_VARS,
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

const metaSnootyProject = {
  name: "meta",
  currentBranch: "master",
  baseUrl: "https://mongodb.com/docs/meta",
};

export const standardConfig = {
  embedder: () => embedder,
  embeddedContentStore: () =>
    makeMongoDbEmbeddedContentStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_META_DATABASE_NAME,
      searchIndex: {
        embeddingName: OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
      },
    }),
  pageStore: () =>
    makeMongoDbPageStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_META_DATABASE_NAME,
    }),
  ingestMetaStore: () =>
    makeIngestMetaStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_META_DATABASE_NAME,
      entryId: "all",
    }),
  chunkOptions: () => ({
    transform: standardChunkFrontMatterUpdater,
  }),
  dataSources: async () => {
    const source = makeSnootyDataSource({
      name: `snooty-${metaSnootyProject.name}`,
      project: {
        ...metaSnootyProject,
        currentBranch: metaSnootyProject.currentBranch,
        type: "snooty",
        baseUrl: metaSnootyProject.baseUrl?.replace(/\/?$/, "/"),
      },
      snootyDataApiBaseUrl,
    });

    return [source];
  },
} satisfies Config;

export default standardConfig;
