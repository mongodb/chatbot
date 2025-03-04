import { OpenAI } from "mongodb-rag-core/openai";
import { ZodSchema, z } from "zod";
import { LlmOptions } from "./LlmOptions";
import zodToJsonSchema from "zod-to-json-schema";

interface GetOpenAiFunctionResponseParams<Schema extends ZodSchema> {
  messages: OpenAI.ChatCompletionMessageParam[];
  llmOptions: LlmOptions;
  schema: Schema;
  functionName: string;
  functionDescription?: string;
}

export async function getOpenAiFunctionResponse<Schema extends ZodSchema>({
  messages,
  llmOptions,
  schema,
  functionName,
  functionDescription,
}: GetOpenAiFunctionResponseParams<Schema>): Promise<z.infer<Schema>> {
  const res = await llmOptions.openAiClient.chat.completions.create({
    messages,
    ...llmOptions,
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
          parameters: zodToJsonSchema(schema),
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
  if (!toolCall || toolCall.function.name !== functionName) {
    throw new Error("Unexpected response format from OpenAI");
  }

  const descriptions = JSON.parse(toolCall.function.arguments);
  return schema.parse(descriptions);
}
