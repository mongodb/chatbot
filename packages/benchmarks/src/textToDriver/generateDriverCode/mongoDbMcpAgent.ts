import {
  generateText,
  LanguageModel,
  ModelMessage,
  stepCountIs,
  experimental_createMCPClient,
  ToolSet,
} from "mongodb-rag-core/aiSdk";
import { wrapTraced } from "mongodb-rag-core/braintrust";
import { MongoClient } from "mongodb-rag-core/mongodb";
import { z } from "zod";
// Note odd import path here, but it's the only way to get class
// ...too much vibe coding on the Anthropic team me thinks.
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import {
  getAtlasSearchIndexesToolName,
  makeGetAtlasSearchIndexesTool,
} from "./tools/getAtlasSearchIndexes";

export interface MakeMongoDbMcpAgentParams {
  model: LanguageModel;
  systemPrompt: string;
  mongoClient: MongoClient;
  httpMcpServerConnectionUrl: URL;
  availableMongoDbMcpTools?: MongoDbMcpToolName[];
  maxSteps?: number;
}

const availableToolNames = [
  "connect",
  "find",
  "aggregate",
  "count",
  "insert-one",
  "insert-many",
  "create-index",
  "update-one",
  "update-many",
  "rename-collection",
  "delete-one",
  "delete-many",
  "drop-collection",
  "drop-database",
  "list-databases",
  "list-collections",
  "collection-indexes",
  getAtlasSearchIndexesToolName,
  "collection-schema",
  "collection-storage-size",
  "db-stats",
] as const;

type MongoDbMcpToolName = (typeof availableToolNames)[number];

const readOnlyToolNames: MongoDbMcpToolName[] = [
  "connect",
  "find",
  "aggregate",
  "count",
  "collection-indexes",
  "list-databases",
  "list-collections",
  "collection-indexes",
  getAtlasSearchIndexesToolName,
  "collection-schema",
  "collection-storage-size",
  "db-stats",
];

export interface MongoDbMcpAgentParams {
  messages: ModelMessage[];
}

export const mongoDbMcpServerName = "mongodb-mcp-server";

export async function makeMongoDbMcpAgent({
  model,
  systemPrompt,
  mongoClient,
  httpMcpServerConnectionUrl,
  availableMongoDbMcpTools = readOnlyToolNames,
  maxSteps = 10,
}: MakeMongoDbMcpAgentParams) {
  const httpTransport = new StreamableHTTPClientTransport(
    httpMcpServerConnectionUrl
  );
  const mongoDbMcpClient = await experimental_createMCPClient({
    transport: httpTransport,
    name: mongoDbMcpServerName,
  });
  // Load full tool set from MCP server
  const fullMcpToolSet = await mongoDbMcpClient.tools();

  // Filter tool set to only include available tools
  const mcpToolSet: ToolSet = Object.fromEntries(
    Object.entries(fullMcpToolSet).filter(([toolName]) =>
      availableMongoDbMcpTools.includes(toolName as MongoDbMcpToolName)
    )
  );
  if (availableMongoDbMcpTools.includes(getAtlasSearchIndexesToolName)) {
    const getAtlasSearchIndexesTool =
      makeGetAtlasSearchIndexesTool(mongoClient);
    mcpToolSet[getAtlasSearchIndexesToolName] = getAtlasSearchIndexesTool;
  }

  return wrapTraced(async function mongoDbMcpAgent({
    messages,
  }: MongoDbMcpAgentParams) {
    const response = await generateText({
      model,
      system: systemPrompt,
      messages,
      stopWhen: [stepCountIs(maxSteps)],
      tools: mcpToolSet,
    });

    return response;
  });
}
