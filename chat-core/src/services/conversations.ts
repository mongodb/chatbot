import { z } from "zod";

/**
 * A formatted reference for an assistant message.
 *
 * For example, a Reference might be a docs page, dev center article, or
 * a MongoDB University module.
 */
export type Reference = z.infer<typeof Reference>;
export const Reference = z.object({
  url: z.string(),
  title: z.string(),
});

export type References = z.infer<typeof References>;
export const References = z.array(Reference);
