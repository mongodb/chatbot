import { Config, INGEST_ENV_VARS, makeIngestMetaStore } from "ingest";
import { standardChunkFrontMatterUpdater } from "ingest/embed";
import {
  assertEnvVars,
  makeOpenAiEmbedder,
  makeDatabaseConnection,
  filterFulfilled,
} from "chat-core";
import { sourceConstructors } from "./sources";

const {
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_EMBEDDING_DEPLOYMENT,
  OPENAI_EMBEDDING_MODEL_VERSION,
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE_NAME,
} = assertEnvVars(INGEST_ENV_VARS);

const embedder = makeOpenAiEmbedder({
  baseUrl: OPENAI_ENDPOINT,
  apiKey: OPENAI_API_KEY,
  apiVersion: OPENAI_EMBEDDING_MODEL_VERSION,
  deployment: OPENAI_EMBEDDING_DEPLOYMENT,
  backoffOptions: {
    numOfAttempts: 25,
    startingDelay: 1000,
  },
});

const embeddedContentStore = makeDatabaseConnection({
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
});

const ingestMetaStore = makeIngestMetaStore({
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
  entryId: "all",
});

const pageStore = embeddedContentStore;

export const standardConfig = {
  embedder,
  embeddedContentStore,
  pageStore,
  ingestMetaStore,
  chunkOptions: {
    transform: standardChunkFrontMatterUpdater,
  },
  dataSources: async () => {
    return filterFulfilled(
      await Promise.allSettled(
        sourceConstructors.map((constructor) => constructor())
      )
    )
      .map(({ value }) => value)
      .flat(1);
  },
} satisfies Config;

export default [standardConfig];
