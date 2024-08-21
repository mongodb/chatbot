import { Message } from "mongodb-chatbot-server";
import { ZodObject, ZodRawShape } from "zod";
import { stripIndents } from "common-tags";
import { zodToJsonSchema } from "zod-to-json-schema";
import { OpenAI } from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

import {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources";

export interface MakeNShotUserMessageExtractorFunctionParams {
  llmFunction: {
    name: string;
    description: string;
    schema: ZodObject<ZodRawShape>;
  };
  systemPrompt: string;
  fewShotExamples: ChatCompletionMessageParam[];
}

/**
  Function to create LLM-based function that extract metadata from a user message in the conversation.
 */
export function makeNShotUserMessageExtractorFunction<
  SchemaType extends Record<string, unknown> = Record<string, unknown>
>({
  // function,
  llmFunction: { name, description, schema },
  systemPrompt,
  fewShotExamples,
}: MakeNShotUserMessageExtractorFunctionParams) {
  const systemPromptMessage = {
    role: "system",
    content: systemPrompt,
  } satisfies ChatCompletionMessageParam;

  const toolDefinition: ChatCompletionTool = {
    type: "function",
    function: {
      name,
      description,
      parameters: zodToJsonSchema(schema, {
        $refStrategy: "none",
      }),
    },
  };
  return async function ({
    openAiClient,
    model,
    userMessageText,
    messages = [],
  }: {
    openAiClient: OpenAI;
    model: string;
    userMessageText: string;
    messages?: Message[];
  }) {
    const userMessage = {
      role: "user",
      content: stripIndents`${
        messages.length > 0
          ? `Preceding conversation messages: ${messages
              .map((m) => m.role + ": " + m.content)
              .join("\n")}`
          : ""
      }

    Original user message: ${userMessageText}`.trim(),
    } satisfies ChatCompletionMessageParam;
    const res = await openAiClient.chat.completions.create({
      messages: [systemPromptMessage, ...fewShotExamples, userMessage],
      temperature: 0,
      model,
      tools: [toolDefinition],
      tool_choice: {
        function: { name: toolDefinition.function.name },
        type: "function",
      },
      // response_format: zodResponseFormat(schema, toolDefinition.function.name),
      stream: false,
    });
    const metadata = schema.parse(
      JSON.parse(
        res.choices[0]?.message?.tool_calls?.[0]?.function.arguments ?? ""
      )
    ) as SchemaType;
    return metadata;
  };
}
