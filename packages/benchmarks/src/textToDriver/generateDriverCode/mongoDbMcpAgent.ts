import {
  generateText,
  LanguageModel,
  ModelMessage,
  stepCountIs,
  hasToolCall,
  experimental_createMCPClient,
  ToolSet,
} from "mongodb-rag-core/aiSdk";
import { wrapTraced } from "mongodb-rag-core/braintrust";
import { MongoClient } from "mongodb-rag-core/mongodb";
import {
  getAtlasSearchIndexesToolName,
  makeGetAtlasSearchIndexesTool,
} from "./tools/getAtlasSearchIndexes";
import {
  submitFinalSolutionTool,
  submitFinalSolutionToolName,
} from "./tools/submitFinalSolution";
import { thinkTool, thinkToolName } from "./tools/think";

export interface MakeMongoDbMcpAgentParams {
  model: LanguageModel;
  systemPrompt: string;
  mongoClient: MongoClient;
  availableMongoDbMcpTools?: MongoDbMcpToolName[];
  maxSteps: number;
  mongoDbMcpClient: Awaited<ReturnType<typeof experimental_createMCPClient>>;
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
  availableMongoDbMcpTools = readOnlyToolNames,
  maxSteps,
  mongoDbMcpClient,
}: MakeMongoDbMcpAgentParams) {
  // Load full tool set from MCP server
  const fullMcpToolSet = await mongoDbMcpClient.tools({
    schemas: "automatic",
  });

  // Filter tool set to only include available tools
  const mcpToolSet: ToolSet = Object.fromEntries(
    Object.entries(fullMcpToolSet).filter(([toolName]) =>
      availableMongoDbMcpTools.includes(toolName as MongoDbMcpToolName),
    ),
  );
  for (const toolName in mcpToolSet) {
    const execute = mcpToolSet[toolName].execute;

    if (execute) {
      const wrappedExecute = async (...args: Parameters<typeof execute>) => {
        try {
          return await execute(...args);
        } catch (error) {
          return {
            isError: true,
            content: [
              {
                type: "text" as const,
                text: `Error executing ${toolName}: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              },
            ],
          };
        }
      };

      mcpToolSet[toolName].execute = wrapTraced(wrappedExecute, {
        name: toolName,
      });
    }
  }

  if (availableMongoDbMcpTools.includes(getAtlasSearchIndexesToolName)) {
    const getAtlasSearchIndexesTool =
      makeGetAtlasSearchIndexesTool(mongoClient);
    mcpToolSet[getAtlasSearchIndexesToolName] = getAtlasSearchIndexesTool;
  }
  // Add think tool for model to reflect.
  mcpToolSet[thinkToolName] = thinkTool;
  // Add submit-final-solution tool for model to submit answer and stop generating.
  mcpToolSet[submitFinalSolutionToolName] = submitFinalSolutionTool;

  return wrapTraced(async function mongoDbMcpAgent({
    messages,
  }: MongoDbMcpAgentParams) {
    const response = await generateText({
      model,
      system: systemPrompt,
      messages,

      stopWhen: [
        stepCountIs(maxSteps),
        hasToolCall(submitFinalSolutionToolName),
      ],
      toolChoice: "required",
      tools: mcpToolSet,
    });

    return response;
  });
}
