import { generateText, LanguageModel } from "mongodb-rag-core/aiSdk";

export const makeSimpleTextGenerator = ({
  model,
  systemPrompt,
}: {
  model: LanguageModel;
  systemPrompt?: string;
}) => {
  return async ({
    prompt,
    temperature = 0,
    n = 1,
  }: {
    prompt: string;
    temperature?: number;

    n?: number;
  }): Promise<string[]> => {
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
};

export type SimpleTextGenerator = ReturnType<typeof makeSimpleTextGenerator>;
