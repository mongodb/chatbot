import z from "zod";
import { promptResponseRatingSchema } from "./rating";
import { embeddingsSchema, relevanceSchema } from "./relevance";

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
  prompt_embeddings: embeddingsSchema.optional(),
  relevance: relevanceSchema.optional(),
  prompt_response_rating: promptResponseRatingSchema.optional(),
});

export type Case = z.infer<typeof Case>;
