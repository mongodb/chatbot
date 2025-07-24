import z from "zod";

// Map of embedding model name -> vector (array of numbers)
export const Embeddings = z.record(z.string(), z.number().array());

export type Embeddings = z.infer<typeof Embeddings>;

export const PromptAndEmbeddings = z.object({
  prompt: z.string(),
  embeddings: Embeddings,
});

export type PromptAndEmbeddings = z.infer<typeof PromptAndEmbeddings>;

export const ScoredPromptAndEmbeddings = PromptAndEmbeddings.and(
  z.object({
    // embedding model name -> score
    relevance: z.record(z.string(), z.number()),
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
  average: z.number(),
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
