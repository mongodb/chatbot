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
import fs from "fs";
import { logPath } from "./logPath.js";
import { logger } from "mongodb-rag-core";

// Suppress all logs from mongodb-rag-core
logger.level = "silent";

let { serverBaseUrl } = argv(process.argv.slice(2));

// Set default values to env or reasonable defaults
serverBaseUrl ??= process.env.SERVER_BASE_URL ?? "http://localhost:3000";

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

registerResources(server);
registerTools(server, serverBaseUrl);
registerPrompts(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  fs.appendFileSync(logPath, "MCP Server running on stdio\n");
  // server.onclose = async () => {
  //   fs.appendFileSync(logPath, "Shutting down MCP Server\n");
  //   await pageStore.close();
  //   await embeddedContentStore.close();
  //   process.exit(0);
  // };
}

main();
// .catch(async (error: unknown) => {
//   await pageStore.close();
//   await embeddedContentStore.close();
//   fs.appendFileSync(logPath, "Fatal error in main():\n");
//   fs.appendFileSync(logPath, JSON.stringify(error));
//   process.exit(1);
// });
