import "dotenv/config";
import {
  ChatRequestMessage,
  FunctionDefinition,
  OpenAIClient,
} from "@azure/openai";
import { stripIndents } from "common-tags";
import { z } from "zod";
import { RunLogger } from "../runlogger";
import {
  formatFewShotExamples,
  formatMessagesForArtifact,
  PromptExamplePair,
} from "./utils";

export type Summarizer = (args: {
  input: string;
}) => Summary | Promise<Summary>;

export type Summary = z.infer<typeof Summary>;
export const Summary = z.object({
  topics: z.array(z.string()),
  description: z.string(),
});

const summarizeTool: FunctionDefinition = {
  name: "summarize",
  description: "A structured summary of the provided input",
  parameters: {
    type: "object",
    properties: {
      topics: {
        type: "array",
        description: "A list of topics mentioned in the input.",
        items: {
          type: "string",
          description:
            "The name of a topic in the input. This could be a product name, a feature, or any other relevant noun mentioned in the input.",
          examples: [
            "MongoDB Atlas",
            "Atlas Search",
            "Architecture",
            "Atlas SQL",
          ],
        },
      },
      description: {
        type: "string",
        description: "A summarized text description of the input.",
      },
    },
    required: ["topics", "description"],
    additionalProperties: false,
  },
};

export function makeSummarizer({
  openAi,
  logger,
  directions = "",
  examples = [],
}: {
  openAi: {
    client: OpenAIClient;
    deployment: string;
  };
  logger?: RunLogger;
  directions?: string;
  examples?: PromptExamplePair[];
}): Summarizer {
  return async function summarize({ input }: { input: string }) {
    const messages = [
      {
        role: "system",
        content:
          `Your task is to summarize a provided input. This information will be used to drive a generative process, so precision and correctness are incredibly important.` +
          directions
            ? `\n\n${directions}`
            : "",
      },
      ...formatFewShotExamples({
        examples,
        functionName: summarizeTool.name,
        responseSchema: Summary,
      }),
      {
        role: "user",
        content: input,
      },
    ] satisfies ChatRequestMessage[];
    const result = await openAi.client.getChatCompletions(
      openAi.deployment,
      messages,
      {
        temperature: 0,
        maxTokens: 1500,
        functions: [summarizeTool],
        functionCall: {
          name: summarizeTool.name,
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
    const summary = Summary.parse(JSON.parse(response.functionCall.arguments));

    logger?.appendArtifact(
      `chatTemplates/summarizer-${Date.now()}.json`,
      stripIndents`
        ${formatMessagesForArtifact(messages).join("\n")}
        <Summary>
          ${JSON.stringify(summary)}
        </Summary>
      `
    );

    return summary;
  };
}
