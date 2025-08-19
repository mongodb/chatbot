import { strict as assert } from "assert";
import { normalizedSquareMagnitudeDifference } from "./squareMagnitude";
import { calculateEmbeddings } from "./calculateEmbeddings";
import { SimpleTextGenerator } from "./generateText";
import { Embedder } from "mongodb-rag-core";
import { cosineSimilarity, createOpenAI, embed } from "mongodb-rag-core/aiSdk";
import { makeShortName } from "./utils";
import { stripIndent } from "common-tags";
import { z } from "zod";

/**
  Answer relevance: given prompt and expected answer pair, generate N possible
  prompts that would elicit that answer, then compare their embeddings with the
  embedding of the original prompt.
 */
export const relevanceMetricsSchema = z.object({
  norm_sq_mag_diff: z.number().describe(
    stripIndent`
      Normalized square magnitude difference. Lower = closer = better. This gives
      an idea of how close the vectors are to each other in their N-dimensional
      space, but doesn't seem to work as well as cos_similarity.
    `
  ),
  cos_similarity: z
    .number()
    .min(-1)
    .describe(
      `Cosine similarity: are vectors pointing the same way? Range [-1, 1].`
    ),
});
export type RelevanceMetrics = z.infer<typeof relevanceMetricsSchema>;

export const embeddingsSchema = z.record(
  z.string().describe("embedding model name"),
  z.number().array().describe("embedding vector")
);

export type Embeddings = z.infer<typeof embeddingsSchema>;

export const promptAndEmbeddingsSchema = z.object({
  prompt: z.string(),
  embeddings: embeddingsSchema,
});

export type PromptAndEmbeddings = z.infer<typeof promptAndEmbeddingsSchema>;

export const scoredPromptAndEmbeddingsSchema = promptAndEmbeddingsSchema.and(
  z.object({
    relevance:
      // embedding model name -> score
      z.record(z.string(), relevanceMetricsSchema),
  })
);

export type ScoredPromptAndEmbeddings = z.infer<
  typeof scoredPromptAndEmbeddingsSchema
>;

/**
  Given the expected answer, generate a number of possible prompts that could
  elicit that expected answer.
 */
async function generatePromptsFromExpectedAnswer({
  response,
  embedders,
  generateText,
  howMany,
}: {
  response: string;
  embedders: Embedder[];
  generateText: SimpleTextGenerator;
  howMany: number;
}): Promise<PromptAndEmbeddings[]> {
  const variants = await generateText({
    prompt: stripIndent`
      Given the following "expected answer", formulate a question that is likely to elicit the expected answer.
      Don't necessarily use proper grammar or punctuation; write like a user of a chatbot, search engine, or LLM would.
      Just return the generated question.

      Expected answer:
      ${response}
    `.trim(),
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
}

const scorePromptVariants = ({
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

export const relevanceSchema = z.object({
  prompt_embeddings: embeddingsSchema,
  generated_prompts: scoredPromptAndEmbeddingsSchema.array(),
  scores: relevanceMetricsSchema,
});

export type Relevance = z.infer<typeof relevanceSchema>;

// Have to create this type because the EmbeddingModel exported
// from the AI SDK doesn't contain the modelId property
// (unclear why, seems like a bug)
export type EmbeddingModelV2 = ReturnType<
  ReturnType<typeof createOpenAI>["textEmbeddingModel"]
>;

function makeEmbedders(embeddingModels: EmbeddingModelV2[]): Embedder[] {
  return embeddingModels.map((e) => {
    return {
      modelName: e.modelId,
      embed: async ({ text }) => {
        const { embedding } = await embed({
          value: text,
          model: e,
        });
        return { embedding };
      },
    } satisfies Embedder;
  });
}

export const assessRelevance = async ({
  prompt,
  embeddingModels,
  response,
  generateText,
}: {
  prompt: string;
  response: string;
  embeddingModels: EmbeddingModelV2[];
  generateText: SimpleTextGenerator;
}): Promise<Relevance> => {
  const shortName = makeShortName(prompt);
  const embedders = makeEmbedders(embeddingModels);

  const promptEmbeddings = await calculateEmbeddings({
    text: prompt,
    embedders,
  });

  const variants = await generatePromptsFromExpectedAnswer({
    embedders,
    response,
    generateText,
    howMany: 3,
  });

  const variantCount = Object.values(variants).length;
  if (variantCount === 0) {
    throw new Error(`Unexpectedly without variants for ${shortName}!`);
  }

  const scoredVariants = scorePromptVariants({
    original: { prompt, embeddings: promptEmbeddings },
    variants,
  });
  assert(variantCount === Object.values(scoredVariants).length);

  // Accumulate raw sums across all models and variants, then divide once at the end
  const { totalCosSimilarity, totalNormSqMagDiff, totalCount } =
    scoredVariants.reduce(
      (
        acc,
        { relevance }
      ): {
        totalCosSimilarity: number;
        totalNormSqMagDiff: number;
        totalCount: number;
      } => {
        const relevanceValues = Object.values(relevance);
        assert(relevanceValues.length > 0);

        for (const { cos_similarity, norm_sq_mag_diff } of relevanceValues) {
          acc.totalCosSimilarity += cos_similarity;
          acc.totalNormSqMagDiff += norm_sq_mag_diff;
          acc.totalCount += 1;
        }
        return acc;
      },
      { totalCosSimilarity: 0, totalNormSqMagDiff: 0, totalCount: 0 }
    );
  const scores: RelevanceMetrics = {
    cos_similarity: totalCosSimilarity / totalCount,
    norm_sq_mag_diff: totalNormSqMagDiff / totalCount,
  };

  return {
    prompt_embeddings: promptEmbeddings,
    generated_prompts: scoredVariants,
    scores,
  };
};
