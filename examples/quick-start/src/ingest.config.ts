import { makeIngestMetaStore, Config } from "mongodb-rag-ingest";
import {
  makeOpenAiEmbedder,
  makeMongoDbEmbeddedContentStore,
  makeMongoDbPageStore,
} from "mongodb-rag-core";
import { strict as assert } from "assert";
import { standardChunkFrontMatterUpdater } from "mongodb-rag-ingest/embed";
import {
  MakeMdOnGithubDataSourceParams,
  makeMdOnGithubDataSource,
} from "mongodb-rag-ingest/sources";
import { OpenAIClient, OpenAIKeyCredential } from "@azure/openai";
const {
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE_NAME,
  OPENAI_API_KEY,
  OPENAI_EMBEDDING_DEPLOYMENT,
} = process.env;

assert(MONGODB_CONNECTION_URI, "MONGODB_CONNECTION_URI is required");
assert(MONGODB_DATABASE_NAME, "MONGODB_DATABASE_NAME is required");
assert(OPENAI_API_KEY, "OPENAI_API_KEY is required");
assert(OPENAI_EMBEDDING_DEPLOYMENT, "OPENAI_EMBEDDING_DEPLOYMENT is required");

// Data source to get the docs content.
export const mongodbRagFrameworkDocsConfig: MakeMdOnGithubDataSourceParams = {
  name: "mongodb-rag-framework",
  repoUrl: "https://github.com/mongodb/chatbot/",
  repoLoaderOptions: {
    branch: "main",
  },
  filter: (path) =>
    path.startsWith("docs/") &&
    path.endsWith(".md") &&
    !path.endsWith("README.md"),
  pathToPageUrl(pathInRepo) {
    const baseUrl = "https://mongodb.github.io/chatbot/";
    const path = pathInRepo.replace(/^docs\/docs\//, "").replace(/\.md$/, "");
    return `${baseUrl}${path}`;
  },
  extractTitle: (pageContent, frontmatter) =>
    (frontmatter?.title as string) ?? extractFirstH1(pageContent),
};

// Helper function
function extractFirstH1(markdownText: string) {
  const lines = markdownText.split("\n");

  for (let line of lines) {
    if (line.startsWith("# ")) {
      // Remove '# ' and any leading or trailing whitespace
      return line.substring(2).trim();
    }
  }
  return null;
}
const mongodbRagFrameworkDocsSourceConstructor = () => {
  return makeMdOnGithubDataSource(mongodbRagFrameworkDocsConfig);
};

export default {
  embedder: () =>
    makeOpenAiEmbedder({
      openAiClient: new OpenAIClient(new OpenAIKeyCredential(OPENAI_API_KEY)),
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
  ingestMetaStore: () =>
    makeIngestMetaStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_DATABASE_NAME,
      entryId: "all",
    }),
  chunkOptions: () => ({
    transform: standardChunkFrontMatterUpdater,
  }),
  // Add data sources here
  dataSources: async () => {
    const mongodbRagFrameworkSource =
      await mongodbRagFrameworkDocsSourceConstructor();

    return [mongodbRagFrameworkSource];
  },
} satisfies Config;
