import { promises as fs } from "fs";
import { ChatRequestMessage } from "mongodb-rag-core";
import { z, ZodTypeAny } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { fromError } from "zod-validation-error";

export function formatMessagesForArtifact(messages: ChatRequestMessage[]) {
  const tagsByRole = {
    system: "SystemMessage",
    user: "UserMessage",
    assistant: "AssistantMessage",
  };
  return messages
    .filter((message) => message.role in tagsByRole)
    .map((message) => {
      const tag = tagsByRole[message.role as keyof typeof tagsByRole];
      const isFunctionCall =
        message.role === "assistant" && message.functionCall;
      const content = !isFunctionCall
        ? message.content
        : `Function Call:\n${JSON.stringify(message.functionCall)}`;

      return `<${tag}>\n${content}\n</${tag}>`;
    });
}

export async function loadPromptExamplePairFromFile(
  path: string
): Promise<PromptExamplePair> {
  const fileDataRaw = await fs.readFile(path, "utf-8");
  const [input, output] = JSON.parse(fileDataRaw);
  return PromptExamplePair.parse([JSON.stringify(input), output]);
}

export function toBulletPoint(text: string) {
  return `* ${text}`;
}

export function asBulletPoints(...lines: string[]) {
  return lines.map(toBulletPoint).join("\n");
}

export type PromptExamplePair = z.infer<typeof PromptExamplePair>;
export const PromptExamplePair = z.tuple([z.string(), z.unknown()]);

export function formatFewShotExamples(args: {
  examples: PromptExamplePair[];
  responseSchema?: ZodTypeAny;
  functionName: string;
}) {
  return args.examples.flatMap(([input, output], exampleIndex) => {
    try {
      const parsedOutput = args.responseSchema
        ? args.responseSchema.parse(output)
        : output;

      return [
        { role: "user", content: input },
        {
          role: "assistant",
          content: null,
          functionCall: {
            name: args.functionName,
            arguments: JSON.stringify(parsedOutput),
          },
        },
      ];
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          [
            `message: Error parsing few shot example at position ${exampleIndex}`,
            `error: ${fromError(error)}`,
            "given: |",
            ...input.split("\n").map((line) => `\t${line}`),
            "expected: |",
            ...JSON.stringify(output, null, 2)
              .split("\n")
              .map((line) => `\t${line}`),
          ].join("\n")
        );
      }
      throw error;
    }
  }) satisfies ChatRequestMessage[];
}

export const UserMessageMongoDbGuardrailFunctionSchema = z.object({
  reasoning: z
    .string()
    .describe(
      "Reason for whether to reject the user query. Be concise. Think step by step. "
    ),
  rejectMessage: z
    .boolean()
    .describe(
      "Set to true if the user query should be rejected. Set to false if the user query should be accepted."
    ),
});

export type AsJsonSchemaOptions = {
  // examples?: PromptExamplePair[];
  zodToJsonSchema?: Parameters<typeof zodToJsonSchema>[1];
};

export function asJsonSchema(
  schema: ZodTypeAny,
  options: AsJsonSchemaOptions = {}
) {
  if (typeof options.zodToJsonSchema === "string") {
    const name = options.zodToJsonSchema;
    options.zodToJsonSchema = { name };
  }
  const convertedJsonSchema = zodToJsonSchema(schema, {
    $refStrategy: "none",
    ...(options.zodToJsonSchema ?? {}),
  });
  return convertedJsonSchema;
}
