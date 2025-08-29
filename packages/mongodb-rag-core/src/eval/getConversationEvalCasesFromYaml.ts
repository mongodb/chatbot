import yaml from "yaml";
import { z } from "zod";

/**
  Zod schema loosely based on the OpenAI.FunctionDefinition interface.
  Validates input tool definitions passed to generateResponse.
 */
export const ToolDefinitionSchema = z.object({
  name: z.string().describe("The name of the function to be called."),
  description: z
    .string()
    .optional()
    .describe("A description of what the function does."),
  parameters: z
    .record(z.string(), z.any())
    .optional()
    .describe(
      "The parameters the tool accepts, as a map of parameter name to its definition.",
    ),
  strict: z
    .boolean()
    .nullable()
    .optional()
    .describe("Whether to enable strict parameter schema adherence."),
});

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
        toolCallName: z
          .string()
          .optional()
          .describe(
            "Only required for tool call messages. Name of the tool being called.",
          ),
      }),
    )
    .min(1),
  tags: z.array(z.string()).optional(),
  skip: z.boolean().optional(),
  reject: z
    .boolean()
    .optional()
    .describe("The system should reject this message"),
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
            "Expected arguments passed to the tool to evaluate against",
          ),
      }),
    )
    .optional()
    .describe(
      "Expected new messages. This array starts with the final messages in 'messages'.",
    ),
  expectedPromptAdherence: z
    .array(z.string())
    .optional()
    .describe(
      "System prompt adherance criteria for the response. Do not add criteria for response quality.",
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
    .describe("Custom, user-defined system prompt to use for this test case."),
  customTools: z
    .array(ToolDefinitionSchema)
    .optional()
    .describe("Any additional user-defined tools to give the LLM access to."),
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
  yamlData: string,
): ConversationEvalCase[] {
  const yamlEvalCases = yaml.parse(yamlData) as unknown[];
  const evalCases = yamlEvalCases.map((tc) =>
    ConversationEvalCaseSchema.parse(tc),
  );
  return evalCases;
}
