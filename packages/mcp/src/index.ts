import { Server } from "@modelcontextprotocol/sdk/server/index.js";
// import { createEJsonTransport } from "./helpers/EJsonTransport.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerResources } from './helpers/resources.js';

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
}

main().catch((error) => {
 console.error("Fatal error in main():", error);
 process.exit(1);
});
