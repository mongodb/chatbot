import "dotenv/config";

import { OpenAI } from "./openai";
import { html, stripIndents } from "common-tags";
import { z } from "zod";

export type Classifier = ({ input }: { input: string }) => Promise<{
  classification: Classification;
  inputMessages: OpenAI.ChatCompletionMessageParam[];
}>;

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
  model,
  classificationTypes,
  chainOfThought = false,
}: {
  openAiClient: OpenAI;
  model: string;

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
  const classifyFunc: OpenAI.FunctionDefinition = {
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
    ] satisfies OpenAI.ChatCompletionMessageParam[];
    const result = await openAiClient.chat.completions.create({
      model,
      messages,
      temperature: 0,
      max_tokens: 300,
      tools: [
        {
          type: "function",
          function: classifyFunc,
        },
      ],
      tool_choice: {
        type: "function",
        function: {
          name: classifyFunc.name,
        },
      },
      stream: false,
    });
    const response = result.choices[0].message;
    if (response === undefined) {
      throw new Error("No response from OpenAI");
    }
    if (response.tool_calls === undefined || response.tool_calls === null) {
      throw new Error("No function call in response from OpenAI");
    }
    const classification = Classification.parse(
      JSON.parse(response.tool_calls[0].function.arguments)
    );

    return { classification, inputMessages: messages };
  };
}
