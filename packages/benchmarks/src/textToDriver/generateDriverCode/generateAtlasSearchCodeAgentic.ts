import { GenerateTextResult, ToolSet } from "mongodb-rag-core/aiSdk";
import { TextToDriverEvalTask, TextToDriverOutput } from "../TextToDriverEval";
import {
  makeMongoDbMcpAgent,
  MakeMongoDbMcpAgentParams,
} from "./mongoDbMcpAgent";
import {
  MongoDbAggregateOperation,
  submitFinalSolutionToolName,
} from "./tools/submitFinalSolution";
import { MongoClient } from "mongodb-rag-core/mongodb";

export async function makeGenerateAtlasSearchCodeAgenticTask(
  constructorArgs: MakeMongoDbMcpAgentParams,
): Promise<TextToDriverEvalTask> {
  const agent = await makeMongoDbMcpAgent(constructorArgs);
  return async function generateAtlasSearchCodeAgentic({
    databaseName,
    nlQuery,
  }) {
    const response = await agent({
      messages: [makeAtlasSearchUserMessage(databaseName, nlQuery)],
    });

    return extractOutputFromMessages(response, constructorArgs.mongoClient);
  };
}

function makeAtlasSearchUserMessage(dbName: string, nlQuery: string) {
  return {
    role: "user" as const,
    content: `Database name: ${dbName}
Natural language query: ${nlQuery}`,
  };
}

async function extractOutputFromMessages(
  agentResponse: GenerateTextResult<ToolSet, unknown>,
  mongoClient: MongoClient,
): Promise<TextToDriverOutput> {
  // Get the result from the tool results in the steps
  const toolResults =
    agentResponse.steps?.flatMap((step) => step.toolCalls ?? []) ?? [];

  const finalSolution = toolResults.findLast(
    (result) => result.toolName === submitFinalSolutionToolName,
  )?.input as MongoDbAggregateOperation | undefined;

  if (!finalSolution) {
    return {
      execution: {
        executionTimeMs: null,
        result: null,
        error: { message: "No final solution found" },
      },
      generatedCode: "",
    } satisfies TextToDriverOutput;
  }

  const collection = mongoClient
    .db(finalSolution.databaseName)
    .collection(finalSolution.collectionName);
  const generatedCode = JSON.stringify(finalSolution.pipeline, null, 2);
  try {
    const startTime = performance.now();
    const result = await collection.aggregate(finalSolution.pipeline).toArray();
    const endTime = performance.now();
    const executionTimeMs = endTime - startTime;
    return {
      execution: {
        executionTimeMs,
        result,
      },
      generatedCode,
    } satisfies TextToDriverOutput;
  } catch (error) {
    return {
      execution: {
        executionTimeMs: null,
        result: null,
        error: {
          message:
            error instanceof Error
              ? error.message
              : `Error executing the generated code: ${error}`,
        },
      },
      generatedCode,
    } satisfies TextToDriverOutput;
  }
}
