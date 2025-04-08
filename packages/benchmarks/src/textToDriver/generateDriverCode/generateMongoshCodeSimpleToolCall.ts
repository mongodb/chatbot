import { generateText, LanguageModelV1, tool, ToolSet } from "ai";
import { z } from "zod";
import {
  DatabaseExecutionResult,
  DatabaseInfo,
  executeMongoshQuery,
  LlmOptions,
  truncateDbOperationOutputForLlm,
} from "mongodb-rag-core/executeCode";
import { mongoshBaseSystemPrompt } from "./languagePrompts/mongosh";
import { TextToDriverEvalTask, TextToDriverOutput } from "../TextToDriverEval";
import {
  makeDatabaseInfoPrompt,
  makeDatabaseInfoPromptSimple,
} from "./makeDatabaseInfoPrompt";

const GENERATE_DB_CODE_TOOL_NAME = "generate_db_code";

type SchemaStrategy = "annotated" | "simple";

export const nlQuerySystemPrompt = `${mongoshBaseSystemPrompt}

Use the '${GENERATE_DB_CODE_TOOL_NAME}' tool to generate a query.
`;

export interface MakeGenerateMongoshCodeSimpleParams {
  uri: string;
  databaseInfos: Record<string, DatabaseInfo>;
  openai: LanguageModelV1;
  llmOptions: Omit<LlmOptions, "openAiClient">;
  schemaStrategy: SchemaStrategy;
}

/**
  Generates a MongoDB Shell (mongosh) query and executes it.
  Uses an agentic pipeline to iteratively think and generate the code.
 */
export function makeGenerateMongoshCodeSimpleTask({
  uri,
  databaseInfos,
  openai,
  llmOptions,
  schemaStrategy = "annotated",
}: MakeGenerateMongoshCodeSimpleParams): TextToDriverEvalTask {
  const generateMongoshCodeSimple: TextToDriverEvalTask =
    async function generateMongoshCodeSimple({ databaseName, nlQuery }) {
      let latestExecution: DatabaseExecutionResult | null = null;
      let latestCode: TextToDriverOutput["generatedCode"] | null = null;
      const res = await generateText({
        temperature: llmOptions.temperature ?? undefined,
        seed: llmOptions.seed ?? undefined,
        maxTokens:
          llmOptions.max_tokens ??
          llmOptions.max_completion_tokens ??
          undefined,
        model: openai,
        toolChoice: {
          toolName: GENERATE_DB_CODE_TOOL_NAME,
          type: "tool",
        },
        tools: {
          [GENERATE_DB_CODE_TOOL_NAME]: tool({
            description:
              "A MongoDB Shell (mongosh) query for the database use case",
            parameters: z.object({
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
              };
            },
          }),
        },
        messages: [
          {
            role: "system",
            content: nlQuerySystemPrompt,
          },
          {
            role: "user",
            content: `Generate MongoDB Shell (mongosh) queries for the following database and natural language query:

${
  schemaStrategy === "annotated"
    ? makeDatabaseInfoPrompt(databaseInfos[databaseName])
    : await makeDatabaseInfoPromptSimple(databaseInfos[databaseName])
}

Natural language query: ${nlQuery}`,
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
  return generateMongoshCodeSimple;
}

const THOUGHTS_FIELD = "thoughts";
const CODE_FIELD = "code";

export const nlQuerySystemPromptCoT = `${mongoshBaseSystemPrompt}

Use the '${GENERATE_DB_CODE_TOOL_NAME}' tool to generate a query.

Before generating the query, in the '${THOUGHTS_FIELD}' field, think about what your query strategy should be. In your thoughts consider:
1. What operation(s) to use and why to use them.
2. What collections and fields are relevant to the query.
3. Which indexes you can use to improve performance.
4. Any specific transformations or projections.
5. Any other relevant considerations.

After you have thought about your query strategy, generate the query in the '${CODE_FIELD}' field.
`;

/**
  Generates a MongoDB Shell (mongosh) query and executes it. Uses chain-of-thought prompting.
  Uses an agentic pipeline to iteratively think and generate the code.
 */
export function makeGenerateMongoshCodeSimpleCotTask({
  uri,
  databaseInfos,
  openai,
  llmOptions,
  schemaStrategy = "annotated",
}: MakeGenerateMongoshCodeSimpleParams): TextToDriverEvalTask {
  const generateMongoshCodeSimple: TextToDriverEvalTask =
    async function generateMongoshCodeSimple({ databaseName, nlQuery }) {
      let latestExecution: DatabaseExecutionResult | null = null;
      let latestCode: TextToDriverOutput["generatedCode"] | null = null;
      const res = await generateText({
        temperature: llmOptions.temperature ?? undefined,
        seed: llmOptions.seed ?? undefined,
        maxTokens:
          llmOptions.max_tokens ??
          llmOptions.max_completion_tokens ??
          undefined,
        model: openai,
        toolChoice: {
          toolName: GENERATE_DB_CODE_TOOL_NAME,
          type: "tool",
        },
        tools: {
          [GENERATE_DB_CODE_TOOL_NAME]: tool({
            description:
              "A MongoDB Shell (mongosh) query for the database use case",
            parameters: z.object({
              [THOUGHTS_FIELD]: z.string().describe("Reasoning about answer"),
              [CODE_FIELD]: z
                .string()
                .describe("Executable mongosh code snippet"),
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
              };
            },
          }),
        },
        messages: [
          {
            role: "system",
            content: nlQuerySystemPromptCoT,
          },
          {
            role: "user",
            content: `Generate MongoDB Shell (mongosh) queries for the following database and natural language query:

${
  schemaStrategy === "annotated"
    ? makeDatabaseInfoPrompt(databaseInfos[databaseName])
    : await makeDatabaseInfoPromptSimple(databaseInfos[databaseName])
}

Natural language query: ${nlQuery}`,
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
  return generateMongoshCodeSimple;
}
