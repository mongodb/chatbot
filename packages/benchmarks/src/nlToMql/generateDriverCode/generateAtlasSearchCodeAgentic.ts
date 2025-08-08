import { TextToDriverEvalTask } from "../TextToDriverEval";
import {
  makeMongoDbMcpAgent,
  MakeMongoDbMcpAgentParams,
} from "./mongoDbMcpAgent";

export async function makeGenerateAtlasSearchCodeAgenticTask(
  args: MakeMongoDbMcpAgentParams
): Promise<TextToDriverEvalTask> {
  const agent = await makeMongoDbMcpAgent(args);
  return async function generateAtlasSearchCodeAgentic({
    databaseName,
    nlQuery,
  }) {
    const response = await agent({
      messages: [makeAtlasSearchUserMessage(databaseName, nlQuery)],
    });
    return {
      dbQuery: response.content,
      execution: {
        executionTimeMs: null,
        result: [],
        error: undefined,
      },
      generatedCode: response.content,
    };
  };
}

function makeAtlasSearchUserMessage(dbName: string, nlQuery: string) {
  return {
    role: "user" as const,
    content: `Database name: ${dbName}
Natural language query: ${nlQuery}`,
  };
}
