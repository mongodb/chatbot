import { strict as assert } from "assert";
import { normalizedSquareMagnitudeDifference } from "./squareMagnitude";
import { calculateEmbeddings } from "./calculateEmbeddings";
import { SimpleTextGenerator } from "./SimpleTextGenerator";
import { Embedder } from "mongodb-rag-core";
import {
  PromptAndEmbeddings,
  Relevance,
  ScoredPromptAndEmbeddings,
} from "./Case";

export const makeShortName = (prompt: string) => {
  return prompt.length > 32 ? prompt.slice(0, 29) + "..." : prompt;
};

/**
  Given the expected answer, generate a number of possible prompts that could
  elicit that expected answer.
 */
export const generatePromptsFromExpectedAnswer = async ({
  expected,
  embedders,
  generate,
  howMany,
}: {
  expected: string;
  embedders: Embedder[];
  generate: SimpleTextGenerator;
  howMany: number;
}): Promise<PromptAndEmbeddings[]> => {
  const variants = await generate({
    prompt: `Given the following "expected answer", formulate a question that is likely to elicit the expected answer. Just return the generated question. Expected answer:\n\n${expected}`,
    n: howMany,
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

export const scoreVariants = ({
  original,
  variants,
}: {
  original: PromptAndEmbeddings;
  variants: PromptAndEmbeddings[];
}): ScoredPromptAndEmbeddings[] => {
  return variants.map(
    ({ embeddings: variantEmbeddings, prompt }): ScoredPromptAndEmbeddings => {
      const relevance = Object.fromEntries(
        Object.entries(original.embeddings).map(
          ([model, originalEmbedding]) => {
            assert(
              variantEmbeddings[model] !== undefined,
              `No embedding for model ${model}!`
            );
            return [
              model,
              normalizedSquareMagnitudeDifference(
                originalEmbedding,
                variantEmbeddings[model]
              ),
            ];
          }
        )
      );
      return {
        embeddings: variantEmbeddings,
        prompt,
        relevance,
      };
    }
  );
};

export const assessRelevance = async ({
  prompt,
  embedders,
  expected,
  generate,
}: {
  prompt: string;
  expected: string;
  embedders: Embedder[];
  generate: SimpleTextGenerator;
}): Promise<Relevance> => {
  const shortName = makeShortName(prompt);
  console.log(`Calculating embeddings for '${shortName}'...`);

  const promptEmbeddings = await calculateEmbeddings({
    text: prompt,
    embedders,
  });

  console.log(`Generating variants for '${shortName}'...`);
  const variants = await generatePromptsFromExpectedAnswer({
    embedders,
    expected,
    generate,
    howMany: 3,
  });
  const variantCount = Object.values(variants).length;
  if (variantCount === 0) {
    throw new Error(`Unexpectedly without variants for ${shortName}!`);
  }

  console.log(`Calculating variant scores for '${shortName}'...`);
  const scoredVariants = scoreVariants({
    original: { prompt, embeddings: promptEmbeddings },
    variants,
  });
  assert(variantCount === Object.values(scoredVariants).length);

  const average =
    scoredVariants.reduce((acc, { relevance }) => {
      const relevanceValues = Object.values(relevance);
      const modelCount = relevanceValues.length;
      assert(modelCount > 0);
      const averageAcrossModels =
        relevanceValues.reduce((acc, cur) => acc + cur, 0) / modelCount;
      return acc + averageAcrossModels;
    }, 0) / variantCount;

  console.log(`Average score for '${shortName}': ${average}`);
  return {
    prompt_embeddings: promptEmbeddings,
    generated_prompts: scoredVariants,
    average,
  };
};
