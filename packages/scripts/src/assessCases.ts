import { strict as assert } from "assert";
import { normalizedSquareMagnitudeDifference } from "./squareMagnitude";
import { calculateEmbeddings } from "./calculateEmbeddings";
import { SimpleTextGenerator } from "./SimpleTextGenerator";
import { Embedder } from "mongodb-rag-core";
import {
  PromptAndEmbeddings,
  Relevance,
  RelevanceMetrics,
  ScoredPromptAndEmbeddings,
} from "./Case";
import { cosineSimilarity } from "mongodb-rag-core/aiSdk";
import { generatePromptsFromExpectedAnswer } from "./generatePromptsFromExpectedAnswer";

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
          ([model, originalEmbedding]): [string, RelevanceMetrics] => {
            assert(
              variantEmbeddings[model] !== undefined,
              `No embedding for model ${model}!`
            );
            return [
              model,
              {
                cos_similarity: cosineSimilarity(
                  originalEmbedding,
                  variantEmbeddings[model]
                ),
                norm_sq_mag_diff: normalizedSquareMagnitudeDifference(
                  originalEmbedding,
                  variantEmbeddings[model]
                ),
              },
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
  expectedResponse,
  generate,
}: {
  prompt: string;
  expectedResponse: string;
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
    expectedResponse,
    generate,
    howMany: 3,
  });

  const variantCount = Object.values(variants).length;
  if (variantCount === 0) {
    throw new Error(`Unexpectedly without variants for ${shortName}!`);
  }

  const scoredVariants = scoreVariants({
    original: { prompt, embeddings: promptEmbeddings },
    variants,
  });
  assert(variantCount === Object.values(scoredVariants).length);

  console.log(
    `- Expected: "${expectedResponse}"
- Original: "${prompt}"
- Generated variants:
${scoredVariants.map(({ prompt }) => `  - "${prompt}"`).join("\n")}`
  );

  const summedMetrics = scoredVariants.reduce(
    (outer, { relevance }): RelevanceMetrics => {
      const relevanceValues = Object.values(relevance);
      const modelCount = relevanceValues.length;
      assert(modelCount > 0);
      // Sum metrics across models
      const crossModel = relevanceValues.reduce(
        (acc, { cos_similarity, norm_sq_mag_diff }) => ({
          cos_similarity: acc.cos_similarity + cos_similarity,
          norm_sq_mag_diff: acc.norm_sq_mag_diff + norm_sq_mag_diff,
        }),
        { cos_similarity: 0, norm_sq_mag_diff: 0 }
      );

      // Accumulate averages across models
      return {
        cos_similarity:
          outer.cos_similarity + crossModel.cos_similarity / modelCount,
        norm_sq_mag_diff:
          outer.norm_sq_mag_diff + crossModel.norm_sq_mag_diff / modelCount,
      };
    },
    { cos_similarity: 0, norm_sq_mag_diff: 0 }
  );
  const averages: RelevanceMetrics = {
    cos_similarity: summedMetrics.cos_similarity / variantCount,
    norm_sq_mag_diff: summedMetrics.norm_sq_mag_diff / variantCount,
  };

  console.log(`Average score: ${JSON.stringify(averages)}`);
  return {
    prompt_embeddings: promptEmbeddings,
    generated_prompts: scoredVariants,
    averages,
  };
};

export const makeShortName = (prompt: string, ellipsizeAtLength = 64) => {
  assert(ellipsizeAtLength > 0);
  return prompt.length > ellipsizeAtLength
    ? prompt.slice(0, ellipsizeAtLength - 3) + "..."
    : prompt;
};
