import yaml from "yaml";
import { z } from "zod";

export const ConversationEvalCaseSchema = z.object({
  name: z.string(),
  expectation: z
    .string()
    .optional()
    .describe(
      "Description of what the test case assesses. Used to evaluate against."
    ),
  messages: z
    .array(
      z.object({
        role: z.enum(["assistant", "user", "system"]),
        content: z.string(),
      })
    )
    .min(1),
  tags: z.array(z.string()).optional(),
  skip: z.boolean().optional(),
  expectedLinks: z
    .array(z.string())
    .optional()
    .describe("Sections of links to relevant sources"),
  reference: z
    .string()
    .optional()
    .describe("Reference answer for model to output"),
});

export type ConversationEvalCase = z.infer<typeof ConversationEvalCaseSchema>;
/**
  Get conversation eval cases from YAML file.
  Throws if the YAML is not correctly formatted.

 */
export function getConversationsEvalCasesFromYaml(
  yamlData: string
): ConversationEvalCase[] {
  const yamlEvalCases = yaml.parse(yamlData) as unknown[];
  const evalCases = yamlEvalCases.map((tc) =>
    ConversationEvalCaseSchema.parse(tc)
  );
  return evalCases;
}
