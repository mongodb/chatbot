import { generateText, LanguageModel } from "mongodb-rag-core/aiSdk";

export type TextGenerator<TextOutput = string> = (args: {
  prompt: string;
  temperature?: number;
  n?: number;
}) => Promise<TextOutput[]>;

export type SimpleTextGenerator = TextGenerator<string>;

export type MakeTextGeneratorParams = {
  model: LanguageModel;
  systemPrompt?: string;
};

export function makeSimpleTextGenerator({
  model,
  systemPrompt,
}: MakeTextGeneratorParams): SimpleTextGenerator {
  return async function simpleTextGenerator({
    prompt,
    temperature = 0,
    n = 1,
  }): Promise<string[]> {
    const result = await Promise.all(
      Array(n)
        .fill(0)
        .map(async () =>
          generateText({
            model,
            prompt,
            system: systemPrompt,
            temperature,
          })
        )
    );
    return result.map(({ text }) => text);
  };
}
