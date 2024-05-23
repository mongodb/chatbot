import "dotenv/config";
import { assertEnvVars } from "mongodb-rag-core";
import {
  ChatRequestMessage,
  FunctionDefinition,
  OpenAIClient,
} from "@azure/openai";
import { html, stripIndents } from "common-tags";
import { z } from "zod";
import { RunLogger } from "../runlogger";

export type Classifier = ({
  input,
}: {
  input: string;
}) => Classification | Promise<Classification>;

export interface ClassificationType {
  /**
    The classification type label.
    @example "usage_example"
    @example "api_reference"
    @example "internal"
    @example "external"
   */
  type: string;
  /**
    A description of the classification type.
    @example "Example of how to use a library or function"
    @example "A change that is internal to the project and not exposed to the public API"
   */
  description: string;
  /**
    Useful for [few-shot prompting](https://www.promptingguide.ai/techniques/fewshot) examples in the system prompt
   */
  examples?: {
    /**
      The example text that is part of this classification.
     */
    text: string;
    /**
      Explain why this example is a good example of the classification type.
      Helps the LLM understand the classification.
     */
    reason?: string;
  }[];
}

export type Classification = z.infer<typeof Classification>;
export const Classification = z.object({
  type: z.string().describe("The classification type."),
  reason: z
    .string()
    .optional()
    .describe(
      "The reason for the classification. Only available if `chainOfThought` was set to `true`."
    ),
});

export function makeClassifier({
  openAiClient,
  logger,
  classificationTypes,
  chainOfThought = false,
}: {
  openAiClient: OpenAIClient;
  logger?: RunLogger;

  /**
   A list of valid classification types.
   */
  classificationTypes: ClassificationType[];
  /**
    If set to `true`, the classification will include a `reason` field
    that performs [chain-of-thought reasoning](https://www.promptingguide.ai/techniques/cot)
    before determining the classification type..
   */
  chainOfThought?: boolean;
}): Classifier {
  const { OPENAI_CHAT_COMPLETION_DEPLOYMENT } = assertEnvVars({
    OPENAI_CHAT_COMPLETION_DEPLOYMENT: "",
  });

  const classificationCategoriesList = classificationTypes
    .map(({ type, description }) => `- ${type}: ${description}`)
    .join("\n");

  const examplesList = classificationTypes
    .filter(({ examples }) => examples?.length ?? 0 > 0)
    .map(({ examples, type }) =>
      (examples ?? [])
        .map(({ text, reason }) =>
          html`
            <Example classification={"${type}"} reason={"${reason ?? "null"}"} >
              ${text}
            </Example>
          `.trimEnd()
        )
        .join("\n")
    )
    .join("\n");
  const makeSystemPrompt = (input: string): string => stripIndents`
    Your task is to classify a provided input into one of the following categories.
    This information will be used to drive a generative process, so precision is incredibly important.

    Classification categories:
    ${classificationCategoriesList}

    Examples:
    ${examplesList}

    Input:
    ${input}
  `;
  // If chainOfThought is true, add a `reason` field to the classification
  const chainOfThoughtProp = chainOfThought
    ? {
        reason: {
          type: "string",
          description:
            "Reason for classification. Be concise. Think step by step.",
        },
      }
    : {};
  const required = chainOfThought ? ["type", "reason"] : ["type"];
  const classifyFunc: FunctionDefinition = {
    name: "classify",
    description: "Classify the type of the provided input",
    parameters: {
      type: "object",
      properties: {
        ...chainOfThoughtProp,
        type: {
          type: "string",
          enum: classificationTypes.map(({ type }) => type),
          description: "Type of the provided input",
        },
      },
      required,
      additionalProperties: false,
    },
  };

  return async function classify({ input }: { input: string }) {
    const messages = [
      {
        role: "system",
        content: makeSystemPrompt(input),
      },
    ] satisfies ChatRequestMessage[];
    const result = await openAiClient.getChatCompletions(
      OPENAI_CHAT_COMPLETION_DEPLOYMENT,
      messages,
      {
        temperature: 0,
        maxTokens: 300,
        functions: [classifyFunc],
        functionCall: {
          name: classifyFunc.name,
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
    const classification = Classification.parse(
      JSON.parse(response.functionCall.arguments)
    );

    logger?.appendArtifact(
      `chatTemplates/classifier-${Date.now()}.json`,
      stripIndents`
        <SystemMessage>
          ${messages[0].content}
        </SystemMessage>
        <Classification>
          ${JSON.stringify(classification)}
        </Classification>
      `
    );

    return classification;
  };
}
