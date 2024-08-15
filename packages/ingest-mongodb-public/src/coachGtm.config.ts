import { Config, makeIngestMetaStore } from "mongodb-rag-ingest";
import {
  PUBLIC_INGEST_COACHGTM_ENV_VARS,
  PUBLIC_INGEST_ENV_VARS,
  PUBLIC_INGEST_MONGODB_DOT_COM_ENV_VARS,
} from "./PublicIngestEnvVars";
import { standardChunkFrontMatterUpdater } from "mongodb-rag-ingest/embed";
import {
  assertEnvVars,
  makeOpenAiEmbedder,
  makeMongoDbEmbeddedContentStore,
  makeMongoDbPageStore,
  filterFulfilled,
  OpenAIClient,
  AzureKeyCredential,
} from "mongodb-rag-core";
import { sourceConstructors } from "./sources";
import { makeMongoDbDotComDataSource } from "./sources/MongoDbDotComDataSource";
import "dotenv/config";

const {
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_EMBEDDING_DEPLOYMENT,
  MONGODB_CONNECTION_URI,
  MONGODB_COACH_GTM_DATABASE_NAME,
  MONGODB_DOT_COM_CONNECTION_URI,
  MONGODB_DOT_COM_DB_NAME,
} = assertEnvVars({
  ...PUBLIC_INGEST_ENV_VARS,
  ...PUBLIC_INGEST_MONGODB_DOT_COM_ENV_VARS,
  ...PUBLIC_INGEST_COACHGTM_ENV_VARS,
});

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

export const standardConfig = {
  embedder: () => embedder,
  embeddedContentStore: () =>
    makeMongoDbEmbeddedContentStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_COACH_GTM_DATABASE_NAME,
    }),
  pageStore: () =>
    makeMongoDbPageStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_COACH_GTM_DATABASE_NAME,
    }),
  ingestMetaStore: () =>
    makeIngestMetaStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_COACH_GTM_DATABASE_NAME,
      entryId: "all",
    }),
  chunkOptions: () => ({
    transform: standardChunkFrontMatterUpdater,
  }),
  dataSources: async () => {
    const eduSources = filterFulfilled(
      await Promise.allSettled(
        sourceConstructors.map((constructor) => constructor())
      )
    )
      .map(({ value }) => value)
      .flat(1);
    const websiteCmsSource = makeMongoDbDotComDataSource({
      connectionUri: MONGODB_DOT_COM_CONNECTION_URI,
      dbName: MONGODB_DOT_COM_DB_NAME,
    });
    return [websiteCmsSource, ...eduSources];
  },
} satisfies Config;

export default standardConfig;
