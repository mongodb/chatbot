import fs from "fs";
import yaml from "yaml";
import { z } from "zod";
import { FETCH_PAGE_TOOL_NAME } from "../tools/fetchPage";
import { SEARCH_TOOL_NAME } from "../tools/search";

export const GenerateWithToolsEvalCaseSchema = z.object({
  name: z.string().describe("Eval case name"),
  input: z.object({
    latestMessageText: z.string().describe("Input user message content"),
    customData: z
      .record(z.unknown())
      .optional()
      .describe("Input request customData"),
  }),
  expected: z.object({
    messages: z.array(
      z.object({
        role: z.enum(["assistant", "assistant-tool", "tool", "user", "system"]),
        toolCallName: z
          .enum([FETCH_PAGE_TOOL_NAME, SEARCH_TOOL_NAME])
          .optional()
          .describe("Expected tool name to evaluate against"),
        toolCallArgs: z
          .record(z.string())
          .optional()
          .describe(
            "Expected arguments passed to the tool to evaluate against",
          ),
      }),
    ),
  }),
  metadata: z
    .object({
      findContentReturnContent: z
        .string()
        .optional()
        .describe("String content that findContent should return"),
      loadPageReturnContent: z
        .string()
        .optional()
        .describe("String content that loadPage should return"),
    })
    .optional()
    .default({}),
  tags: z
    .array(
      z.enum([
        "fetch_page",
        "search_content",
        "has_url",
        "multi_url",
        "implied_url",
        "fallback_to_search",
      ]),
    )
    .optional()
    .describe("Braintrust tags"),
});

export type GenerateWithToolsEvalCase = z.infer<
  typeof GenerateWithToolsEvalCaseSchema
>;

export function getGenerateWithToolsEvalCasesFromYamlFile(
  filePath: string,
): GenerateWithToolsEvalCase[] {
  const yamlData = fs.readFileSync(filePath, "utf8");
  const yamlEvalCases = yaml.parse(yamlData) as unknown[];
  const evalCases = yamlEvalCases.map((tc) =>
    GenerateWithToolsEvalCaseSchema.parse(tc),
  );
  return evalCases;
}
