import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerResources } from './helpers/resourceHandler.js';
// import { registerTools } from './helpers/toolHandler.js';
// import { createEJsonTransport } from "./helpers/EJsonTransport.js";

const server = new Server({
    name: "MongoDB Docs MCP Server",
    version: "1.0.0",
}, {
    capabilities: {
        resources: {}
    }
});

registerResources(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});