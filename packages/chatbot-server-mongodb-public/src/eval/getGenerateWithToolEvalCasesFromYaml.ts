import yaml from "yaml";
import { z } from "zod";
import { FETCH_PAGE_TOOL_NAME } from "../tools/fetchPage";
import { SEARCH_TOOL_NAME } from "../tools/search";

export const GenerateWithToolsEvalCaseSchema = z.object({
  name: z.string(),
  input: z
    .object({
      latestMessageText: z.string(),
    })
    .describe("Input to generateResponseWithTools"),
  expected: z
    .object({
      messages: z.array(
        z.object({
          role: z.enum([
            "assistant",
            "assistant-tool",
            "tool",
            "user",
            "system",
          ]),
          toolCallName: z
            .enum([FETCH_PAGE_TOOL_NAME, SEARCH_TOOL_NAME])
            .optional(),
          toolCallArgs: z.record(z.string()).optional(),
        })
      ),
    })
    .describe(
      "Description of what the test case assesses. Used to evaluate against."
    ),
  metadata: z
    .object({
      findContentReturnContent: z.string().optional(),
      loadPageReturnContent: z.string().optional(),
    })
    .optional()
    .default({}),
  tags: z.array(z.string()).optional(),
  skip: z.boolean().optional().default(false),
});

export type GenerateWithToolsEvalCase = z.infer<
  typeof GenerateWithToolsEvalCaseSchema
>;

export function getGenerateWithToolsEvalCasesFromYaml(
  yamlData: string
): GenerateWithToolsEvalCase[] {
  const yamlEvalCases = yaml.parse(yamlData) as unknown[];
  const evalCases = yamlEvalCases.map((tc) =>
    GenerateWithToolsEvalCaseSchema.parse(tc)
  );
  return evalCases;
}
