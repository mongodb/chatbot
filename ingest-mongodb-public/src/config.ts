import { Config, INGEST_ENV_VARS, makeIngestMetaStore } from "ingest";
import { standardChunkFrontMatterUpdater } from "ingest/embed";
import {
  assertEnvVars,
  makeOpenAiEmbedder,
  makeMongoDbEmbeddedContentStore,
  makeMongoDbPageStore,
  filterFulfilled,
  OpenAIClient,
  AzureKeyCredential,
} from "chat-core";
import { sourceConstructors } from "./sources";

const {
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_EMBEDDING_DEPLOYMENT,
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE_NAME,
} = assertEnvVars(INGEST_ENV_VARS);

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
      databaseName: MONGODB_DATABASE_NAME,
    }),
  pageStore: () =>
    makeMongoDbPageStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_DATABASE_NAME,
    }),
  ingestMetaStore: () =>
    makeIngestMetaStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_DATABASE_NAME,
      entryId: "all",
    }),
  chunkOptions: () => ({
    transform: standardChunkFrontMatterUpdater,
  }),
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

export default standardConfig;
