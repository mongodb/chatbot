import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerResources } from "./handlers/resources.js";
import { registerTools } from "./handlers/tools.js";
import { registerPrompts } from "./handlers/prompts.js";
import {
  makeDefaultFindContent,
  makeMongoDbEmbeddedContentStore,
  makeMongoDbPageStore,
  makeOpenAiEmbedder,
} from "mongodb-rag-core";
import { AzureOpenAI } from "mongodb-rag-core/openai";
import "dotenv/config";
import argv from "yargs-parser";
import { strict as assert } from "assert";

let {
  openAiApiKey,
  openAiEndpoint,
  openAiApiVersion,
  openAiEmbeddingModel,
  vectorSearchIndexName,
  mongoDbConnectionUri,
  mongoDbDatabaseName,
} = argv(process.argv.slice(2));

// Set default values to env or reasonable defaults
openAiApiKey ??= process.env.OPENAI_API_KEY;
openAiEndpoint ??= process.env.OPENAI_ENDPOINT;
openAiApiVersion ??= process.env.OPENAI_API_VERSION ?? "2024-06-01";
openAiEmbeddingModel ??=
  process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";
vectorSearchIndexName ??=
  process.env.VECTOR_SEARCH_INDEX_NAME ?? openAiEmbeddingModel;
mongoDbConnectionUri ??= process.env.MONGODB_CONNECTION_URI;
mongoDbDatabaseName ??= process.env.MONGODB_DATABASE_NAME;

assert(openAiApiKey, "openAiApiKey is required");
assert(openAiEndpoint, "openAiEndpoint is required");
assert(openAiApiVersion, "openAiApiVersion is required");
assert(openAiEmbeddingModel, "openAiEmbeddingModel is required");
assert(vectorSearchIndexName, "vectorSearchIndexName is required");
assert(mongoDbConnectionUri, "mongoDbConnectionUri is required");
assert(mongoDbDatabaseName, "mongoDbDatabaseName is required");

const server = new Server(
  {
    name: "MongoDB Education MCP Server",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {
        listTools: {},
        callTool: {},
      },
      prompts: {},
    },
  }
);

const pageStore = makeMongoDbPageStore({
  connectionUri: mongoDbConnectionUri,
  databaseName: mongoDbDatabaseName,
});
const embeddedContentStore = makeMongoDbEmbeddedContentStore({
  connectionUri: mongoDbConnectionUri,
  databaseName: mongoDbDatabaseName,
  searchIndex: {
    embeddingName: vectorSearchIndexName,
  },
});
const findContent = makeDefaultFindContent({
  embedder: makeOpenAiEmbedder({
    openAiClient: new AzureOpenAI({
      apiKey: openAiApiKey,
      baseURL: openAiEndpoint,
      apiVersion: openAiApiVersion,
    }),
    deployment: openAiEmbeddingModel,
  }),
  store: embeddedContentStore,
});

registerResources(server);
registerTools(server, pageStore, findContent);
registerPrompts(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server running on stdio");
  server.onclose = async () => {
    console.error("Shutting down MCP Server");
    await pageStore.close();
    await embeddedContentStore.close();
    process.exit(0);
  };
}

main().catch(async (error: unknown) => {
  await pageStore.close();
  await embeddedContentStore.close();
  console.error("Fatal error in main():", error);
  process.exit(1);
});
