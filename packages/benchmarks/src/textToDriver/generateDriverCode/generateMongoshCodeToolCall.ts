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
  mongoshSystemPromptGeneralInstruction,
} from "./languagePrompts/mongosh";
import { TextToDriverEvalTask, TextToDriverOutput } from "../TextToDriverEval";
import { makeDatabaseInfoPrompt } from "./makeDatabaseInfoPrompt";
import { FewShotExample } from "./languagePrompts/FewShotExample";
import {
  SchemaStrategy,
  SystemPromptStrategy,
} from "./languagePrompts/PromptStrategies";

const GENERATE_DB_CODE_TOOL_NAME = "generate_db_code";
const QUERY_PLAN_FIELD = "query_plan";
const CODE_FIELD = "code";

const toolCallInstructions = `Use the '${GENERATE_DB_CODE_TOOL_NAME}' tool to generate a query.`;

export const nlQuerySystemPromptLazy = `${mongoshSystemPromptGeneralInstruction}

${toolCallInstructions}
`;

export const nlQuerySystemPromptDefault = `${mongoshBaseSystemPrompt}

${toolCallInstructions}
`;

export const nlQuerySystemPromptCoT = `${mongoshBaseSystemPrompt}

${toolCallInstructions}

Before generating the query, in the '${QUERY_PLAN_FIELD}' field, think about what your query plan should be. ${chainOfThoughtConsiderations}

After you have thought about your query plan, generate the query in the '${CODE_FIELD}' field.
`;

type FewShotPromptType = "default" | "chainOfThought";

export interface MakeGenerateMongoshCodeSimpleParams {
  uri: string;
  databaseInfos: Record<string, DatabaseInfo>;
  openai: LanguageModelV1;
  llmOptions: Omit<LlmOptions, "openAiClient">;
  schemaStrategy: SchemaStrategy;
  fewShot?: boolean;
  systemPromptStrategy?: SystemPromptStrategy;
}

/**
  Generates a MongoDB Shell (mongosh) query and executes it.
  Uses tool-calling to generate the code.
  Configurable options to support different prompting strategies.
 */
export function makeGenerateMongoshCodeToolCallTask({
  uri,
  databaseInfos,
  openai,
  llmOptions,
  schemaStrategy = "annotated",
  fewShot,
  systemPromptStrategy = "default",
}: MakeGenerateMongoshCodeSimpleParams): TextToDriverEvalTask {
  const systemPrompt = {
    default: nlQuerySystemPromptDefault,
    chainOfThought: nlQuerySystemPromptCoT,
    lazy: nlQuerySystemPromptLazy,
  }[systemPromptStrategy];
  const generateMongoshCodeSimple: TextToDriverEvalTask =
    async function generateMongoshCodeSimple({ databaseName, nlQuery }) {
      // We instantiate the result here so that we can mutate it
      // in the tool call via closure
      const finalResult: TextToDriverOutput = {
        execution: {
          result: null,
          executionTimeMs: null,
          error: {
            message: "An unexpected error occurred",
          },
        },
        generatedCode: "",
      };
      await generateText({
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
          [GENERATE_DB_CODE_TOOL_NAME]: makeDbCodeTool({
            databaseName,
            uri,
            output: finalResult,
            hasQueryPlan: systemPromptStrategy === "chainOfThought",
          }),
        },
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `Generate MongoDB Shell (mongosh) queries for the following database and natural language query:

${await makeDatabaseInfoPrompt(databaseInfos[databaseName], schemaStrategy)}
${
  fewShot
    ? "\n" +
      makeFewShotExamplesPrompt(
        genericFewShotExamples,
        systemPromptStrategy === "chainOfThought" ? "chainOfThought" : undefined
      ) +
      "\n"
    : ""
}
Natural language query: ${nlQuery}`,
          },
        ],
      });
      if (!finalResult.execution) {
        throw new Error("latestExecution is null");
      }
      if (!finalResult.generatedCode) {
        throw new Error("latestCode is null");
      }
      return finalResult;
    };
  return generateMongoshCodeSimple;
}

function makeDbCodeTool({
  databaseName,
  uri,
  output,
  hasQueryPlan,
}: {
  databaseName: string;
  uri: string;
  output: TextToDriverOutput;
  hasQueryPlan: boolean;
}) {
  return tool({
    description: "A MongoDB Shell (mongosh) query for the database use case",
    parameters: z.object({
      ...(hasQueryPlan
        ? { [QUERY_PLAN_FIELD]: z.string().describe("Query plan") }
        : {}),
      [CODE_FIELD]: z.string().describe("Executable mongosh code snippet"),
    }),
    execute: async (args) => {
      const execution = await executeMongoshQuery({
        databaseName: databaseName,
        query: args[CODE_FIELD],
        uri,
      });
      output.execution = execution;
      output.generatedCode = args[CODE_FIELD];
      return {
        ...execution,
        result: truncateDbOperationOutputForLlm(execution.result),
      };
    },
  });
}

function makeFewShotExamplesPrompt(
  examples: FewShotExample[],
  fewShotType: FewShotPromptType = "default"
): string {
  if (fewShotType === "chainOfThought") {
    return `
  
  A few example input and outputs:
  
  ${examples
    .map(
      (ex) => `Input: ${ex.input}
Output:
{
  ${QUERY_PLAN_FIELD}: "${ex.output.chainOfThought}",
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
