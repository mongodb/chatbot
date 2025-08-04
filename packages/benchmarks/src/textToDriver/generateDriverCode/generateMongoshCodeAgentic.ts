import {
  generateText,
  LanguageModel,
  stepCountIs,
  tool,
} from "mongodb-rag-core/aiSdk";
import { z } from "zod";
import {
  DatabaseExecutionResult,
  DatabaseInfo,
  executeMongoshQuery,
  isReasonableResult,
  LlmOptions,
  truncateDbOperationOutputForLlm,
} from "mongodb-rag-core/executeCode";
import {
  chainOfThoughtConsiderations,
  mongoshBaseSystemPrompt,
} from "./languagePrompts/mongosh";
import { TextToDriverEvalTask, TextToDriverOutput } from "../TextToDriverEval";
import { makeDatabaseInfoPrompt } from "./makeDatabaseInfoPrompt";
import { getVerySimplifiedSchema } from "mongodb-rag-core/executeCode";

const QUERY_PLAN_TOOL_NAME = "query_plan";
const GENERATE_DB_CODE_TOOL_NAME = "generate_db_code";
const OUTPUT_SUMMARY = "outputSummary";

export const nlQuerySystemPrompt = `${mongoshBaseSystemPrompt}

You may use the '${QUERY_PLAN_TOOL_NAME}' tool before you generate a query with the '${GENERATE_DB_CODE_TOOL_NAME}' tool.
${chainOfThoughtConsiderations}

If the results seem suboptimal in some way, use the '${QUERY_PLAN_TOOL_NAME}' tool to plan a new query accordingly. Refer to the '${OUTPUT_SUMMARY}' field to understand the results of the previous query. A query should be reasonable and correct. Repeat as necessary.

A few considerations while debugging queries:
1. It may be advantageous to adopt a strategy of progressive complexity if you are not clear what to do. Build up and execute your query incrementally across multiple tool calls. Using the \`$project\` operator can be helpful to verify the shape of the data you are working with.
2. Use can use the \`$type\` operator to verify a field's BSON type.


YOU MUST ALWAYS use the '${GENERATE_DB_CODE_TOOL_NAME}' tool to generate a query before completing.
ALWAYS make AT LEAST 2 tool calls, at least one to '${QUERY_PLAN_TOOL_NAME}' and '${GENERATE_DB_CODE_TOOL_NAME}' before responding to the user.
When you are satisfied with the results of '${GENERATE_DB_CODE_TOOL_NAME}', simply say 'Done'`;

export interface MakeGenerateMongoshCodeAgenticParams {
  uri: string;
  databaseInfos: Record<string, DatabaseInfo>;
  openai: LanguageModel;
  llmOptions: Omit<LlmOptions, "openAiClient">;
  includeOutputShape?: boolean;
}

/**
  Generates a MongoDB Shell (mongosh) query and executes it.
  Uses an agentic pipeline to iteratively think and generate the code.
 */
export function makeGenerateMongoshCodeAgenticTask({
  uri,
  databaseInfos,
  openai,
  llmOptions,
  includeOutputShape = false,
}: MakeGenerateMongoshCodeAgenticParams): TextToDriverEvalTask {
  const generateMongoshCodeAgentic: TextToDriverEvalTask =
    async function generateMongoshCodeAgentic(
      { databaseName, nlQuery },
      hooks
    ) {
      let latestExecution: DatabaseExecutionResult | null = null;
      let latestCode: TextToDriverOutput["generatedCode"] | null = null;
      const res = await generateText({
        temperature: llmOptions.temperature ?? undefined,
        seed: llmOptions.seed ?? undefined,
        maxOutputTokens:
          llmOptions.max_tokens ??
          llmOptions.max_completion_tokens ??
          undefined,
        model: openai,
        tools: {
          [QUERY_PLAN_TOOL_NAME]: tool({
            description:
              "Think about the query plan given the natural language query and any previous results (if present). Plan the next query accordingly.",
            inputSchema: z.object({
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
            inputSchema: z.object({
              code: z.string().describe("Executable mongosh code snippet"),
            }),
            execute: async (args) => {
              const execution = await executeMongoshQuery({
                databaseName: databaseName,
                query: args.code,
                uri,
              });
              latestExecution = execution;
              latestCode = args.code;
              return {
                ...execution,
                result: truncateDbOperationOutputForLlm(execution.result),
                [OUTPUT_SUMMARY]: isReasonableResult(execution.result),
              };
            },
          }),
        },
        stopWhen: [stepCountIs(10)],
        messages: [
          {
            role: "system",
            content: nlQuerySystemPrompt,
          },
          {
            role: "user",
            content:
              `Generate MongoDB Shell (mongosh) queries for the following database and natural language query:

${await makeDatabaseInfoPrompt(databaseInfos[databaseName])}

Natural language query: ${nlQuery}
${
  includeOutputShape
    ? `Your output should have the following shape:
${await getVerySimplifiedSchema(hooks.expected?.result)}`
    : ""
}`.trimEnd(),
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
      } satisfies TextToDriverOutput;
    };
  return generateMongoshCodeAgentic;
}
