import { OpenAI } from "openai";
import { ZodSchema, z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { LlmOptions } from "./LlmOptions";

interface GetOpenAiFunctionResponseParams<Schema extends ZodSchema> {
  messages: OpenAI.ChatCompletionMessageParam[];
  llmOptions: LlmOptions;
  schema: Schema;
  functionName: string;
  functionDescription?: string;
  openAiClient: OpenAI;
}

export async function getOpenAiFunctionResponse<Schema extends ZodSchema>({
  messages,
  llmOptions,
  schema,
  functionName,
  functionDescription,
  openAiClient,
}: GetOpenAiFunctionResponseParams<Schema>): Promise<z.infer<Schema>> {
  const parameters = zodToJsonSchema(schema, {
    $refStrategy: "none",
  });
  const { ...createChatCompletionParams } = llmOptions;
  const res = await openAiClient.chat.completions.create({
    messages,
    ...createChatCompletionParams,
    tool_choice: {
      type: "function",
      function: {
        name: functionName,
      },
    },
    tools: [
      {
        type: "function",
        function: {
          name: functionName,
          description: functionDescription,
          parameters,
        },
      },
    ],
  });
  return parseObjectFromOpenAiResponse(res, functionName, schema);
}

function parseObjectFromOpenAiResponse<Schema extends ZodSchema>(
  response: OpenAI.ChatCompletion,
  functionName: string,
  schema: Schema
): z.infer<Schema> {
  const toolCall = response.choices[0].message.tool_calls?.[0];
  if (
    !toolCall ||
    !(toolCall.type === "function") ||
    toolCall.function.name !== functionName
  ) {
    throw new Error("Unexpected response format from OpenAI");
  }
  const descriptions = JSON.parse(toolCall.function.arguments);
  return schema.parse(descriptions);
}
