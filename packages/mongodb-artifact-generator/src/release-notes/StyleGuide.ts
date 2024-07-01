import { stripIndents } from "common-tags";
import { z } from "zod";

export type StyleGuideData = z.infer<typeof StyleGuideData>;
export const StyleGuideData = z.object({
  description: z.string().describe(stripIndents`
    A description of how to write about the topic that this applies to. This
    can define the content, tone, style, and formatting of the
    output.
  `),
  examples: z
    .array(z.string())
    .describe(
      stripIndents`
        Examples that demonstrate how to write about the topic that this applies to.
        For best results, these should follow the style guide's description.
      `
    )
    .optional(),
});

export type StyleGuide = z.infer<typeof StyleGuide>;
export const StyleGuide = z.object({
  summary: StyleGuideData.optional(),
  changelog: StyleGuideData.optional(),
});
