import { Message } from "mongodb-chatbot-server";
import { z, ZodObject, ZodRawShape } from "zod";
import { stripIndents } from "common-tags";
import { zodToJsonSchema } from "zod-to-json-schema";
import { OpenAI } from "openai";
import {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources";

export interface MakeFewShotUserMessageExtractorFunctionParams<
  T extends ZodObject<ZodRawShape>
> {
  llmFunction: {
    name: string;
    description: string;
    schema: T;
  };
  systemPrompt: string;
  fewShotExamples: ChatCompletionMessageParam[];
}

/**
  Function to create LLM-based function that extract metadata from a user message in the conversation.
 */
export function makeFewShotUserMessageExtractorFunction<
  T extends ZodObject<ZodRawShape>
>({
  llmFunction: { name, description, schema },
  systemPrompt,
  fewShotExamples,
}: MakeFewShotUserMessageExtractorFunctionParams<T>) {
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
  return async function fewShotUserMessageExtractorFunction({
    openAiClient,
    model,
    userMessageText,
    messages = [],
  }: {
    openAiClient: OpenAI;
    model: string;
    userMessageText: string;
    messages?: Message[];
  }): Promise<z.infer<T>> {
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
      stream: false,
    });
    const metadata = schema.parse(
      JSON.parse(
        res.choices[0]?.message?.tool_calls?.[0]?.function.arguments ?? "{}"
      )
    );
    return metadata;
  };
}

export function makeUserMessage(content: string) {
  return {
    role: "user",
    content,
  } satisfies ChatCompletionMessageParam;
}

export function makeAssistantFunctionCallMessage(
  name: string,
  args: Record<string, unknown>
) {
  return {
    role: "assistant",
    content: null,
    function_call: {
      name,
      arguments: JSON.stringify(args),
    },
  } satisfies ChatCompletionMessageParam;
}
