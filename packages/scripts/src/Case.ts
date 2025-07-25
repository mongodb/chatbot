import z from "zod";

// Map of embedding model name -> vector (array of numbers)
export const Embeddings = z.record(z.string(), z.number().array());

export type Embeddings = z.infer<typeof Embeddings>;

export const PromptAndEmbeddings = z.object({
  prompt: z.string(),
  embeddings: Embeddings,
});

export type PromptAndEmbeddings = z.infer<typeof PromptAndEmbeddings>;

export const RelevanceMetrics = z.object({
  // normalized square magnitude difference (lower = closer = better)
  norm_sq_mag_diff: z.number(),
  // cosine similarity (are vectors pointing the same way?) [-1, 1]
  cos_similarity: z.number(),
});

export type RelevanceMetrics = z.infer<typeof RelevanceMetrics>;

export const ScoredPromptAndEmbeddings = PromptAndEmbeddings.and(
  z.object({
    relevance:
      // embedding model name -> score
      z.record(z.string(), RelevanceMetrics),
  })
);

export type ScoredPromptAndEmbeddings = z.infer<
  typeof ScoredPromptAndEmbeddings
>;

export const LlmAsJudgment = z.object({
  reasonableness: z.number(),
  clarity: z.number(),
  specificity: z.number(),
  fit: z.number(),
  assumption: z.number(),
});

export type LlmAsJudgment = z.infer<typeof LlmAsJudgment>;

export const Relevance = z.object({
  prompt_embeddings: Embeddings,
  generated_prompts: ScoredPromptAndEmbeddings.array(),
  averages: RelevanceMetrics,
});

export type Relevance = z.infer<typeof Relevance>;

export const Case = z.object({
  type: z.string(),
  tags: z.string().array(),
  name: z.string(),
  prompt: z
    .object({
      content: z.string(),
      role: z.string(),
    })
    .array(),
  expected: z.string(),

  // Fields to add
  prompt_embeddings: Embeddings.optional(),
  relevance: Relevance.optional(),
  llm_as_judgment: LlmAsJudgment.optional(),
});

export type Case = z.infer<typeof Case>;
