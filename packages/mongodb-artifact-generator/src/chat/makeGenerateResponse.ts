import { OpenAI } from "mongodb-rag-core/openai";
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

const generateResponseTool: OpenAI.FunctionDefinition = {
  name: "generateResponse",
  description: "A response generated based on a given context.",
  parameters: asJsonSchema(GeneratedResponse),
};

export type MakeGenerateResponseArgs = {
  openAi: {
    client: OpenAI;
    model: string;
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
    ] satisfies OpenAI.ChatCompletionMessageParam[];
    const result = await openAi.client.chat.completions.create({
      model: openAi.model,
      messages,
      temperature: 0,
      max_tokens: 1500,
      functions: [generateResponseTool],
      function_call: {
        name: generateResponseTool.name,
      },
    });
    const response = result.choices[0].message;
    if (response === undefined) {
      throw new Error("No response from OpenAI");
    }
    if (
      response.function_call === undefined ||
      response.function_call === null
    ) {
      throw new Error("No function call in response from OpenAI");
    }
    const generatedResponse = GeneratedResponse.parse(
      JSON.parse(response.function_call.arguments)
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
