import {
  ChatRequestMessage,
  FunctionDefinition,
  OpenAIClient,
} from "mongodb-rag-core";
import { FormattedJiraIssueWithSummary } from "../commands/generateJiraPromptResponse";
import { RunLogger } from "../runlogger";
import {
  asJsonSchema,
  formatFewShotExamples,
  formatMessagesForArtifact,
  PromptExamplePair,
} from "./utils";
import { z } from "zod";
import { stripIndents } from "common-tags";

export type GeneratedPrompts = z.infer<typeof GeneratedPrompts>;
export const GeneratedPrompts = z.object({
  prompts: z.array(z.string()).min(1).max(4),
});

const generatePromptsTool: FunctionDefinition = {
  name: "generatePrompts",
  description:
    "A list of generated example prompts that would elicit a given response.",
  parameters: asJsonSchema(GeneratedPrompts),
};

export type MakeGeneratePromptsArgs = {
  openAi: {
    client: OpenAIClient;
    deployment: string;
  };
  logger?: RunLogger;
  directions?: string;
  examples?: PromptExamplePair[];
};

export type GeneratePromptsArgs = FormattedJiraIssueWithSummary;

export function makeGeneratePrompts({
  openAi,
  logger,
  directions,
  examples = [],
}: MakeGeneratePromptsArgs) {
  return async function generatePrompts({
    issue,
    summary,
  }: GeneratePromptsArgs) {
    const messages = [
      {
        role: "system",
        content: [
          `Your task is to convert a provided input into a prompt-response format. The format mimics a conversation where one participant sends a prompt and the other replies with a response.`,
          directions ?? "",
        ].join("\n"),
      },
      ...formatFewShotExamples({
        examples,
        functionName: generatePromptsTool.name,
        responseSchema: GeneratedPrompts,
      }),
      {
        role: "user",
        content: JSON.stringify({ issue, summary }),
      },
    ] satisfies ChatRequestMessage[];
    const result = await openAi.client.getChatCompletions(
      openAi.deployment,
      messages,
      {
        temperature: 0,
        maxTokens: 1500,
        functions: [generatePromptsTool],
        functionCall: {
          name: generatePromptsTool.name,
        },
      }
    );
    const response = result.choices[0].message;
    if (response === undefined) {
      throw new Error("No response from OpenAI");
    }
    if (response.functionCall === undefined) {
      throw new Error("No function call in response from OpenAI");
    }
    const generatedPrompts = GeneratedPrompts.parse(
      JSON.parse(response.functionCall.arguments)
    );

    logger?.appendArtifact(
      `chatTemplates/generatePrompts-${Date.now()}.json`,
      stripIndents`
        ${formatMessagesForArtifact(messages).join("\n")}
        <Summary>
          ${JSON.stringify(summary)}
        </Summary>
      `
    );

    return generatedPrompts;
  };
}
