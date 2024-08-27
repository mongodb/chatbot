import {
  Config,
  INGEST_ENV_VARS,
  makeIngestMetaStore,
} from "mongodb-rag-ingest";
import { standardChunkFrontMatterUpdater } from "mongodb-rag-ingest/embed";
import {
  assertEnvVars,
  makeOpenAiEmbedder,
  makeMongoDbEmbeddedContentStore,
  makeMongoDbPageStore,
  OpenAIClient,
  AzureKeyCredential,
} from "mongodb-rag-core";
import { snootyDataApiBaseUrl } from "./sources/snooty";
import { makeSnootyDataSource } from "./sources/snooty/SnootyDataSource";

const {
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_EMBEDDING_DEPLOYMENT,
  MONGODB_CONNECTION_URI,
  MONGODB_META_DATABASE_NAME,
} = assertEnvVars({ ...INGEST_ENV_VARS, MONGODB_META_DATABASE_NAME: "" });

const embedder = makeOpenAiEmbedder({
  openAiClient: new OpenAIClient(
    OPENAI_ENDPOINT,
    new AzureKeyCredential(OPENAI_API_KEY)
  ),
  deployment: OPENAI_EMBEDDING_DEPLOYMENT,
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
