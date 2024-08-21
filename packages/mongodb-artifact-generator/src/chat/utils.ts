import { ChatRequestMessage } from "mongodb-rag-core";
import { promises as fs } from "fs";
import { z } from "zod";

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

export type PromptExamplePair = z.infer<typeof PromptExamplePair>;
export const PromptExamplePair = z.tuple([z.string(), z.string()]);

export async function loadPromptExamplePairFromFile(
  path: string
): Promise<PromptExamplePair> {
  const fileDataRaw = await fs.readFile(path, "utf-8");
  const [input, output] = JSON.parse(fileDataRaw);
  return PromptExamplePair.parse([
    JSON.stringify(input),
    JSON.stringify(output),
  ]);
}

export function formatFewShotExamples(args: {
  examples: PromptExamplePair[];
  outputRole?: "assistant" | "function" | "tool";
}) {
  return args.examples.flatMap(([input, output]) => [
    { role: "user", content: input },
    {
      role: "assistant",
      content: null,
      functionCall: { name: "summarizeTool", arguments: output },
    },
  ]) satisfies ChatRequestMessage[];
}

export function toBulletPoint(text: string) {
  return `* ${text}`;
}
