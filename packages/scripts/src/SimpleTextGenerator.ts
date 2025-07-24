import { OpenAI } from "mongodb-rag-core/openai";

export const makeSimpleTextGenerator = ({
  client,
  model,
  systemPrompt,
}: {
  client: OpenAI;
  model: string;
  systemPrompt?: string;
}) => {
  return async ({
    prompt,
    temperature = 0,
    maxTokens = 1500,
    n = 1,
  }: {
    prompt: string;
    temperature?: number;
    maxTokens?: number;
    n?: number;
  }): Promise<string[]> => {
    const messages = [
      {
        role: "system",
        content: systemPrompt ?? "",
      },
      {
        role: "user",
        content: prompt,
      },
    ] satisfies OpenAI.ChatCompletionMessageParam[];
    const result = await client.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      n,
    });
    return result.choices.map(({ message: { content } }) => {
      if (content === null) {
        throw new Error(`Failed to generate content!`);
      }
      return content;
    });
  };
};

export type SimpleTextGenerator = ReturnType<typeof makeSimpleTextGenerator>;
