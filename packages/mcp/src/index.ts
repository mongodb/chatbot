import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerResources } from "./handlers/resources.js";
import { registerTools } from "./handlers/tools.js";
import { registerPrompts } from "./handlers/prompts.js";
import {
  assertEnvVars,
  makeDefaultFindContent,
  makeMongoDbEmbeddedContentStore,
  makeMongoDbPageStore,
  makeOpenAiEmbedder,
} from "mongodb-rag-core";
import { OpenAI } from "mongodb-rag-core/openai";
import "dotenv/config";

const {
  BRAINTRUST_API_KEY,
  BRAINTRUST_ENDPOINT,
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE_NAME,
  VECTOR_SEARCH_INDEX_NAME,
  OPENAI_EMBEDDING_MODEL,
} = assertEnvVars({
  BRAINTRUST_API_KEY: "",
  BRAINTRUST_ENDPOINT: "",
  MONGODB_CONNECTION_URI: "",
  MONGODB_DATABASE_NAME: "",
  VECTOR_SEARCH_INDEX_NAME: "",
  OPENAI_EMBEDDING_MODEL: "",
});

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
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
});
const embeddedContentStore = makeMongoDbEmbeddedContentStore({
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
  searchIndex: {
    embeddingName: VECTOR_SEARCH_INDEX_NAME,
  },
});
const findContent = makeDefaultFindContent({
  embedder: makeOpenAiEmbedder({
    openAiClient: new OpenAI({
      apiKey: BRAINTRUST_API_KEY,
      baseURL: BRAINTRUST_ENDPOINT,
    }),
    deployment: OPENAI_EMBEDDING_MODEL,
  }),
  store: embeddedContentStore,
});

registerResources(server);
registerTools(server, pageStore, findContent);
registerPrompts(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("MCP Server running on stdio");
  server.onclose = async () => {
    console.log("Shutting down MCP Server");
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
