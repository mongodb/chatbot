import {
  ChatRequestMessage,
  FunctionDefinition,
  OpenAIClient,
} from "mongodb-rag-core";
import { FormattedJiraIssue } from "../commands/generateJiraPromptResponse";
import { RunLogger } from "../runlogger";
import {
  asJsonSchema,
  formatFewShotExamples,
  formatMessagesForArtifact,
  PromptExamplePair,
} from "./utils";
import { z } from "zod";
import { stripIndents } from "common-tags";
import { Summary } from "./makeSummarizer";

export type GeneratedResponse = z.infer<typeof GeneratedResponse>;
export const GeneratedResponse = z.object({
  response: z.string().describe("The generated response text."),
});

const generateResponseTool: FunctionDefinition = {
  name: "generateResponse",
  description: "A response generated based on a given context.",
  parameters: asJsonSchema(GeneratedResponse),
};

export type MakeGenerateResponseArgs = {
  openAi: {
    client: OpenAIClient;
    deployment: string;
  };
  logger?: RunLogger;
  directions?: string;
  examples?: PromptExamplePair[];
};

export type GenerateResponseArgs = {
  issue: FormattedJiraIssue;
  summary: Summary;
  prompt: string;
};

export function makeGenerateResponse({
  openAi,
  logger,
  directions,
  examples = [],
}: MakeGenerateResponseArgs) {
  return async function generateResponse({
    issue,
    summary,
    prompt,
  }: GenerateResponseArgs) {
    const messages = [
      {
        role: "system",
        content: [
          `Your task is to generate a response to a provided input. The response should be relevant to the input and based only on the provided context.`,
          directions ?? "",
        ].join("\n"),
      },
      ...formatFewShotExamples({
        examples,
        functionName: generateResponseTool.name,
        responseSchema: GeneratedResponse,
      }),
      {
        role: "user",
        content: JSON.stringify({ issue, summary, prompt }),
      },
    ] satisfies ChatRequestMessage[];
    const result = await openAi.client.getChatCompletions(
      openAi.deployment,
      messages,
      {
        temperature: 0,
        maxTokens: 1500,
        functions: [generateResponseTool],
        functionCall: {
          name: generateResponseTool.name,
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
    const generatedResponse = GeneratedResponse.parse(
      JSON.parse(response.functionCall.arguments)
    );

    logger?.appendArtifact(
      `chatTemplates/generateResponse-${Date.now()}.json`,
      stripIndents`
        ${formatMessagesForArtifact(messages).join("\n")}
        <Summary>
          ${JSON.stringify(summary)}
        </Summary>
      `
    );

    return generatedResponse;
  };
}
