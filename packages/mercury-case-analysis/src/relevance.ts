import { strict as assert } from "assert";
import { normalizedSquareMagnitudeDifference } from "./squareMagnitude";
import { calculateEmbeddings } from "./calculateEmbeddings";
import { SimpleTextGenerator } from "./generateText";
import { Embedder } from "mongodb-rag-core";
import { cosineSimilarity, EmbeddingModel } from "mongodb-rag-core/aiSdk";
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

export const assessRelevance = async ({
  prompt,
  embedders,
  response,
  generateText,
}: {
  prompt: string;
  response: string;
  embedders: Embedder[];
  generateText: SimpleTextGenerator;
}): Promise<Relevance> => {
  const shortName = makeShortName(prompt);

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

      // Accumulate average scores across models
      return {
        cos_similarity:
          (outer.cos_similarity + crossModel.cos_similarity) / modelCount,
        norm_sq_mag_diff:
          (outer.norm_sq_mag_diff + crossModel.norm_sq_mag_diff) / modelCount,
      };
    },
    { cos_similarity: 0, norm_sq_mag_diff: 0 }
  );
  const scores: RelevanceMetrics = {
    cos_similarity: summedMetrics.cos_similarity / variantCount,
    norm_sq_mag_diff: summedMetrics.norm_sq_mag_diff / variantCount,
  };

  return {
    prompt_embeddings: promptEmbeddings,
    generated_prompts: scoredVariants,
    scores,
  };
};

export function makeEmbedders(
  embeddingModels: EmbeddingModel<string>[]
): Embedder[] {
  return embeddingModels.map((e) => {
    return {
      modelName: e.modelId,
      embed: async ({ text }) => {
        const { embeddings } = await e.doEmbed({ values: [text] });
        return { embedding: embeddings[0] };
      },
    } satisfies Embedder;
  });
}
