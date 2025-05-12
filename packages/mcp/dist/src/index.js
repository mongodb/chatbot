#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { packageInfo } from "./helpers/packageInfo.js";
import { createEJsonTransport } from "./helpers/EJsonTransport.js";
import { registerResources } from './helpers/resources.js';
try {
    const server = new Server({
        name: packageInfo.mcpServerName,
        version: packageInfo.version,
    }, {
        capabilities: {
            resources: {}
        }
    });
    registerResources(server);
    const transport = createEJsonTransport();
    await server.connect(transport);
}
catch (error) {
    console.error("Error starting MCP server:", error);
    process.exit(1);
}
//# sourceMappingURL=index.js.map