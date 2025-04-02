import { OpenAIProvider } from "@ai-sdk/openai";
import { generateText, tool } from "ai";
import { z } from "zod";
import {
  DatabaseExecutionResult,
  DatabaseInfo,
  executeMongoshQuery,
  LlmOptions,
  truncateDbOperationOutputForLlm,
} from "mongodb-rag-core/executeCode";
import { mongoshBaseSystemPrompt } from "./languagePrompts/mongosh";
import { TextToDriverInput, TextToDriverOutput } from "../TextToDriverEval";
import { makeDatabaseInfoPrompt } from "./makeDatabaseInfoPrompt";

const THINK_TOOL_NAME = "think";
const GENERATE_DB_CODE_TOOL_NAME = "generate_db_code";

export const nlQuerySystemPrompt = `${mongoshBaseSystemPrompt}

Always use the '${THINK_TOOL_NAME}' tool before you generate a query with the '${GENERATE_DB_CODE_TOOL_NAME}' tool. If the results seem suboptimal in some way, use the '${THINK_TOOL_NAME}' tool to plan a new query accordingly. Repeat as necessary.
YOU MUST ALWAYS use the '${GENERATE_DB_CODE_TOOL_NAME}' tool to generate a query before completing.
ALWAYS make AT LEAST 2 tool calls, at least one to '${THINK_TOOL_NAME}' and '${GENERATE_DB_CODE_TOOL_NAME}' before responding to the user.
When you are satisfied with the results of '${GENERATE_DB_CODE_TOOL_NAME}', simply say 'Done'`;

export interface GenerateMongoshCodeAgenticParams {
  databaseName: string;
  uri: string;
  databaseInfo: DatabaseInfo;
  nlQuery: TextToDriverInput;
  openai: OpenAIProvider;
  llmOptions: LlmOptions;
}

/**
  Generates a MongoDB Shell (mongosh) query and executes it.
  Uses an agentic pipeline to iteratively think and generate the code.
 */
export async function generateMongoshCodeAgentic({
  databaseName,
  uri,
  databaseInfo,
  nlQuery,
  openai,
  llmOptions,
}: GenerateMongoshCodeAgenticParams) {
  let latestExecution: DatabaseExecutionResult | null = null;
  let latestCode: TextToDriverOutput["generatedCode"] | null = null;

  const res = await generateText({
    temperature: llmOptions.temperature ?? undefined,
    seed: llmOptions.seed ?? undefined,
    maxTokens:
      llmOptions.max_tokens ?? llmOptions.max_completion_tokens ?? undefined,
    model: openai(llmOptions.model, {
      structuredOutputs: true,
    }),
    tools: {
      [THINK_TOOL_NAME]: tool({
        description:
          "Think about the query plan given the natural language query and any previous results (if present). Plan the next query accordingly.",
        parameters: z.object({
          thoughts: z
            .string()
            .describe("Your thoughts and plan for the next query"),
        }),
        execute: async () => {
          return "Ok, now generate the query or think more.";
        },
      }),
      [GENERATE_DB_CODE_TOOL_NAME]: tool({
        description:
          "A MongoDB Shell (mongosh) query for the database use case",
        parameters: z.object({
          code: z.string().describe("Executable mongosh code snippet"),
        }),
        execute: async (args) => {
          const execution = await executeMongoshQuery({
            databaseName,
            query: args.code,
            uri,
          });
          latestExecution = execution;
          latestCode = args.code;
          return {
            ...execution,
            result: truncateDbOperationOutputForLlm(execution.result),
          };
        },
      }),
    },
    maxSteps: 10,
    messages: [
      {
        role: "system",
        content: nlQuerySystemPrompt,
      },
      {
        role: "user",
        content: `Generate MongoDB Shell (mongosh) queries for the following database and natural language query:

${makeDatabaseInfoPrompt(databaseInfo)}

Natural language query: ${nlQuery.nl_query}`,
      },
    ],
  });
  if (!latestExecution) {
    throw new Error("latestExecution is null");
  }
  if (!latestCode) {
    throw new Error("latestCode is null");
  }
  return {
    execution: latestExecution as DatabaseExecutionResult,
    generatedCode: latestCode,
    pipelineOutput: res,
  } satisfies TextToDriverOutput & { pipelineOutput: typeof res };
}
