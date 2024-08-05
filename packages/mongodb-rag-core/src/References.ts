import { z } from "zod";

/**
  A formatted reference for an assistant message.
 
  For example, a Reference might be a docs page, dev center article, or
  a MongoDB University module.
 */
export type Reference = z.infer<typeof Reference>;
export const Reference = z.object({
  url: z.string(),
  title: z.string(),
  metadata: z
    .object({
      sourceName: z.string().optional().describe("The name of the source."),
      sourceType: z.string().optional(),
      tags: z.array(z.string()).optional(),
    })
    .passthrough() // We accept additional unknown metadata fields
    .optional(),
});

export type References = z.infer<typeof References>;
export const References = z.array(Reference);
