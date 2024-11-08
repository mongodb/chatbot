import { promises as fs } from "fs";
import { OpenAI } from "mongodb-rag-core/openai";
import { z, ZodTypeAny } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { fromError } from "zod-validation-error";
import { assistantMessage, userMessage } from ".";

export function formatMessagesForArtifact(
  messages: OpenAI.ChatCompletionMessageParam[]
) {
  const tagsByRole = {
    system: "SystemMessage",
    user: "UserMessage",
    assistant: "AssistantMessage",
    tool: "ToolMessage",
    function: "FunctionMessage",
  };
  return messages
    .filter((message) => message.role in tagsByRole)
    .map((message) => {
      const tag = tagsByRole[message.role as keyof typeof tagsByRole];
      const isFunctionCall =
        message.role === "assistant" &&
        (message.function_call ?? undefined) !== undefined;
      const content = !isFunctionCall
        ? message.content
        : `Function Call:\n${JSON.stringify(message.function_call)}`;

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
}): OpenAI.ChatCompletionMessageParam[] {
  return args.examples.flatMap(([input, output], exampleIndex) => {
    try {
      const parsedOutput = args.responseSchema
        ? args.responseSchema.parse(output)
        : output;

      return [
        userMessage({
          content: input,
        }),
        assistantMessage({
          content: null,
          function_call: {
            name: args.functionName,
            arguments: JSON.stringify(parsedOutput),
          },
        }),
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
  });
}

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
