import { Config } from "./Config";
import { ArtifactGeneratorEnvVars } from "./ArtifactGeneratorEnvVars";
import {
  assertEnvVars,
  makeOpenAiEmbedder,
  makeMongoDbEmbeddedContentStore,
  makeMongoDbPageStore,
  OpenAIClient,
  AzureKeyCredential,
} from "mongodb-rag-core";

const {
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_EMBEDDING_DEPLOYMENT,
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE_NAME,
} = assertEnvVars(ArtifactGeneratorEnvVars);


export const standardConfig = {
  embedder: () =>
    makeOpenAiEmbedder({
      openAiClient: new OpenAIClient(
        OPENAI_ENDPOINT,
        new AzureKeyCredential(OPENAI_API_KEY)
      ),
      deployment: OPENAI_EMBEDDING_DEPLOYMENT,
      backoffOptions: {
        numOfAttempts: 25,
        startingDelay: 1000,
      },
    }),
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
} satisfies Config;

export default standardConfig;
