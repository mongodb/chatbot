import { Embedder } from "mongodb-rag-core";
import { SimpleTextGenerator } from "./SimpleTextGenerator";
import { PromptAndEmbeddings } from "./Case";
import { calculateEmbeddings } from "./calculateEmbeddings";

/**
  Given the expected answer, generate a number of possible prompts that could
  elicit that expected answer.
 */
export const generatePromptsFromExpectedAnswer = async ({
  expectedResponse,
  embedders,
  generate,
  howMany,
}: {
  expectedResponse: string;
  embedders: Embedder[];
  generate: SimpleTextGenerator;
  howMany: number;
}): Promise<PromptAndEmbeddings[]> => {
  const variants = await generate({
    prompt: `Given the following "expected answer", formulate a question that is likely to elicit the expected answer.
Don't necessarily use proper grammar or punctuation; write like a user of a chatbot, search engine, or LLM would.
Just return the generated question.

Expected answer:\n\n${expectedResponse}`,
    n: howMany,
    temperature: 0.5,
  });

  return await Promise.all(
    variants.map(async (text) => {
      return {
        prompt: text,
        embeddings: await calculateEmbeddings({ embedders, text }),
      };
    })
  );
};
