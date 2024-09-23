import { AzureOpenAI } from "openai";
import { z, ZodObject, ZodRawShape } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export type MakeAnalyzerArgs<Schema extends ZodObject<ZodRawShape>> = {
  openAi: {
    client: AzureOpenAI;
    model: string;
  };
  zodSchema: Schema;
};

export function makeAnalyzer<Schema extends ZodObject<ZodRawShape>>({
  openAi,
  zodSchema,
}: MakeAnalyzerArgs<Schema>) {
  const schema = zodToJsonSchema(zodSchema);
  return async function analyze(input: string): Promise<z.infer<Schema>> {
    const {
      choices: [{ message: response }],
    } = await openAi.client.chat.completions.create({
      model: openAi.model,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "analysis",
          strict: true,
          schema,
        },
      },
      messages: [
        {
          role: "system",
          content:
            "Your task is to analyze the provided input and then provide a structured analysis of its contents.",
        },
        {
          role: "user",
          content: input,
        },
      ],
    });

    if (!response.content) {
      throw new Error("Failed to analyze. No response from OpenAI.");
    }
    return zodSchema.parse(JSON.parse(response.content));
  };
}
