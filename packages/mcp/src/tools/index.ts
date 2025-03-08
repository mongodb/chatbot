/**
 * MongoDB MCP Tools
 *
 * This module exports MongoDB-related tools for the MCP server.
 */

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  executeQuery,
  executeAggregation,
  executeUpdate,
  getDatabaseInfo,
  getCollectionSchema,
  executeGenericQuery,
} from "./mongodb";

const ExecuteGenericSchema = {
  query: z.string(),
  limit: z.number().optional(),
};
/**
 * Register MongoDB tools with the MCP server
 */
export function registerMongoDbTools(server: McpServer) {
  // Hello World tool (example)
  // server.tool("hello_world", { name: z.string() }, async ({ name }) => ({
  //   content: [{ type: "text" as const, text: `Hello, ${name}!` }],
  // }));

  // MongoDB Query tool
  // server.tool(
  //   "mongodb_execute_query",
  //   {
  //     collection: z.string(),
  //     query: z.string(),
  //   },
  //   async (params) => executeQuery(params)
  // );

  // // MongoDB Aggregation tool
  // server.tool(
  //   "mongodb_execute_aggregation",
  //   {
  //     collection: z.string(),
  //     pipeline: z.string(),
  //   },
  //   async (params) => executeAggregation(params)
  // );

  // // MongoDB Update tool
  // server.tool(
  //   "mongodb_execute_update",
  //   {
  //     collection: z.string(),
  //     filter: z.string(),
  //     update: z.string(),
  //     options: z.string().optional(),
  //   },
  //   async (params) => executeUpdate(params)
  // );

  // MongoDB Database Info tool
  // server.tool(
  //   "mongodb_get_database_info",
  //   {
  //     /* Empty schema, but we need to pass an empty object */
  //   },
  //   async (_params) => getDatabaseInfo()
  // );

  // MongoDB Collection Schema tool
  // server.tool(
  //   "mongodb_get_collection_schema",
  //   {
  //     collection: z.string(),
  //   },
  //   async (params) => getCollectionSchema(params)
  // );

  // MongoDB Generic Query tool
  server.tool(
    "mongodb_execute_operation",
    "Execute a MongoDB query using the Node.js driver. You have access to a `db` object that refers to the relevant database. Use .toArray() for any cursor operations. Limit results to at most 10 items unless otherwise specified with .limit(10). NEVER EVER EVER write to a collection without first asking user permission.",
    ExecuteGenericSchema,
    async (params) => executeGenericQuery(params)
  );
}
