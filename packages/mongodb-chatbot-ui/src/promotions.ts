import { z } from "zod";

export const PromotionSchema = z.object({
  type: z.string(),
  topic: z.string().optional().describe("The topic of the promotion. Used for Skills"),
  title: z.string(),
  description: z.string(), 
  url: z.string(),
  metadata: z
    .object({})
    .passthrough()
    .optional(),
});

export type Promotion = z.infer<typeof PromotionSchema>;
