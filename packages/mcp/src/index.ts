import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerResources } from "./handlers/resources.js";
import { registerTools } from "./handlers/tools.js";
import { registerPrompts } from "./handlers/prompts.js";
// import { createEJsonTransport } from "./helpers/EJsonTransport.js";

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
registerTools(server);
registerPrompts(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
