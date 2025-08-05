import yaml from "yaml";
import { z } from "zod";

export const ConversationEvalCaseSchema = z.object({
  name: z.string(),
  expectation: z // Not used by scorers - This is just for our reference
    .string()
    .optional()
    .describe("Description of what the test case assesses."),
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
  reject: z
    .boolean()
    .optional()
    .describe("The system should reject this message"),
  // Can probably simplify this by excluding assistant-tool and just check for toolargs/name instead in assistant msgs.
  expectedMessageDetail: z
    .array(
      z.object({
        role: z.enum(["assistant", "assistant-tool", "tool", "user", "system"]),
        toolCallName: z
          .string()
          .optional()
          .describe("Expected tool name to evaluate against."),
        toolCallArgs: z
          .record(z.string())
          .optional()
          .describe(
            "Expected arguments passed to the tool to evaluate against"
          ),
      })
    )
    .optional(),
  expectedPromptAdherence: z
    .array(z.string())
    .optional()
    .describe(
      "System prompt adherance criteria for the response. Do not add criteria for response quality, only evaluate whether instructions were followed."
    ),
  expectedLinks: z
    .array(z.string())
    .optional()
    .describe("Sections of links to relevant sources"),
  reference: z
    .string()
    .optional()
    .describe("Reference answer for model to output"),
  customSystemPrompt: z
    .string()
    .optional()
    .describe("Custom system prompt to use for this test case"),
  customTools: z
    .object({})
    .optional()
    .describe("Custom tools to pass to LLM for use during generation"),
  customData: z
    .record(z.unknown())
    .optional()
    .describe("Input request customData."),
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
