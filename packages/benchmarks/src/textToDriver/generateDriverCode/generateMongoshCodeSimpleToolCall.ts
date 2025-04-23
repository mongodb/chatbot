import { generateText, LanguageModelV1, tool } from "ai";
import { z } from "zod";
import {
  DatabaseExecutionResult,
  DatabaseInfo,
  executeMongoshQuery,
  LlmOptions,
  truncateDbOperationOutputForLlm,
} from "mongodb-rag-core/executeCode";
import {
  chainOfThoughtConsiderations,
  genericFewShotExamples,
  mongoshBaseSystemPrompt,
} from "./languagePrompts/mongosh";
import { TextToDriverEvalTask, TextToDriverOutput } from "../TextToDriverEval";
import { makeDatabaseInfoPrompt } from "./makeDatabaseInfoPrompt";
import { FewShotExample } from "./languagePrompts/FewShotExample";
import { SchemaStrategy } from "./languagePrompts/PromptStrategies";

const GENERATE_DB_CODE_TOOL_NAME = "generate_db_code";
const THOUGHTS_FIELD = "thoughts";
const CODE_FIELD = "code";

export const nlQuerySystemPrompt = `${mongoshBaseSystemPrompt}

Use the '${GENERATE_DB_CODE_TOOL_NAME}' tool to generate a query.
`;

type FewShotPromptType = "basic" | "chainOfThought";
export interface MakeGenerateMongoshCodeSimpleParams {
  uri: string;
  databaseInfos: Record<string, DatabaseInfo>;
  openai: LanguageModelV1;
  llmOptions: Omit<LlmOptions, "openAiClient">;
  schemaStrategy: SchemaStrategy;
  fewShot?: FewShotPromptType;
}

/**
  Generates a MongoDB Shell (mongosh) query and executes it.
  Uses tool-calling to generate the code.
 */
export function makeGenerateMongoshCodeSimpleTask({
  uri,
  databaseInfos,
  openai,
  llmOptions,
  schemaStrategy = "annotated",
  fewShot,
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
              [CODE_FIELD]: z
                .string()
                .describe("Executable mongosh code snippet"),
            }),
            execute: async (args) => {
              const execution = await executeMongoshQuery({
                databaseName: databaseName,
                query: args[CODE_FIELD],
                uri,
              });
              latestExecution = execution;
              latestCode = args[CODE_FIELD];
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

${await makeDatabaseInfoPrompt(databaseInfos[databaseName], schemaStrategy)}
${
  fewShot
    ? "\n" + makeFewShotExamplesPrompt(genericFewShotExamples, fewShot) + "\n"
    : ""
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

export const nlQuerySystemPromptCoT = `${mongoshBaseSystemPrompt}

Use the '${GENERATE_DB_CODE_TOOL_NAME}' tool to generate a query.

Before generating the query, in the '${THOUGHTS_FIELD}' field, think about what your query strategy should be. ${chainOfThoughtConsiderations}

After you have thought about your query strategy, generate the query in the '${CODE_FIELD}' field.
`;

/**
  Generates a MongoDB Shell (mongosh) query and executes it. Uses chain-of-thought prompting.
  Uses tool-calling to generate the code.
 */
export function makeGenerateMongoshCodeSimpleCotTask({
  uri,
  databaseInfos,
  openai,
  llmOptions,
  schemaStrategy = "annotated",
  fewShot,
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
                query: args[CODE_FIELD],
                uri,
              });
              latestExecution = execution;
              latestCode = args[CODE_FIELD];
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

${await makeDatabaseInfoPrompt(databaseInfos[databaseName], schemaStrategy)}
${
  fewShot
    ? "\n" + makeFewShotExamplesPrompt(genericFewShotExamples, fewShot) + "\n"
    : ""
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

function makeFewShotExamplesPrompt(
  examples: FewShotExample[],
  fewShotType: FewShotPromptType = "basic"
): string {
  if (fewShotType === "chainOfThought") {
    return `
  
  A few example input and outputs:
  
  ${examples
    .map(
      (ex) => `Input: ${ex.input}
Output:
{
  ${THOUGHTS_FIELD}: "${ex.output.chainOfThought}",
  ${CODE_FIELD}: "${ex.output.content}"
}`
    )
    .join("\n\n")}`;
  } else {
    return `A few example input and outputs:
  
  ${examples
    .map(
      (ex) => `Input: ${ex.input}
Output:
{
  ${CODE_FIELD}: "${ex.output.content}"
}`
    )
    .join("\n\n")}`;
  }
}
