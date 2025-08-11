import { GenerateTextResult, ToolSet } from "mongodb-rag-core/aiSdk";
import { TextToDriverEvalTask, TextToDriverOutput } from "../TextToDriverEval";
import {
  makeMongoDbMcpAgent,
  MakeMongoDbMcpAgentParams,
} from "./mongoDbMcpAgent";

export async function makeGenerateAtlasSearchCodeAgenticTask(
  constructorArgs: MakeMongoDbMcpAgentParams
): Promise<TextToDriverEvalTask> {
  const agent = await makeMongoDbMcpAgent(constructorArgs);
  return async function generateAtlasSearchCodeAgentic({
    databaseName,
    nlQuery,
  }) {
    const response = await agent({
      messages: [makeAtlasSearchUserMessage(databaseName, nlQuery)],
    });

    return extractOutputFromMessages(response);
  };
}

function makeAtlasSearchUserMessage(dbName: string, nlQuery: string) {
  return {
    role: "user" as const,
    content: `Database name: ${dbName}
Natural language query: ${nlQuery}`,
  };
}

function extractOutputFromMessages(
  agentResponse: GenerateTextResult<ToolSet, unknown>
): TextToDriverOutput {
  // Find the last call to the `aggregate` tool
  const toolCalls =
    agentResponse.steps?.flatMap((step) => step.toolCalls || []) || [];
  const lastAggregateCall = toolCalls.findLast(
    (call) => call.toolName === "aggregate"
  );

  if (!lastAggregateCall) {
    return {
      execution: {
        executionTimeMs: null,
        result: null,
        error: { message: "No tool calls found" },
      },
      generatedCode: "",
    } satisfies TextToDriverOutput;
  }

  // Extract the tool call argument and stringify it for generatedCode
  const generatedCode = JSON.stringify(lastAggregateCall.input, null, 2);

  // Get the result from the tool results in the steps
  const toolResults =
    agentResponse.steps?.flatMap((step) => step.toolResults || []) || [];
  const correspondingResult = toolResults.find(
    (result) => result.toolCallId === lastAggregateCall.toolCallId
  );
  const toolResult = correspondingResult?.output || null;

  return {
    execution: {
      executionTimeMs: null,
      result: toolResult,
    },
    generatedCode,
  } satisfies TextToDriverOutput;
}
