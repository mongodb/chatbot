import { parse } from "yaml";
import { z } from "zod";

export const referenceSchema = z.object({
  uri: z.string(),
  title: z.optional(z.string()),
});

export type Reference = z.infer<typeof referenceSchema>;

/**
  Verified answers as specified in the verified answer yaml.
 */
export const verifiedAnswerSpecSchema = z.object({
  questions: z.array(z.string()),
  answer: z.string(),
  author_email: z.string(),
  hidden: z.optional(z.boolean()),
  references: z.array(referenceSchema),
});

export type VerifiedAnswerSpec = z.infer<typeof verifiedAnswerSpecSchema>;

export const parseVerifiedAnswerYaml = (yaml: string): VerifiedAnswerSpec[] => {
  if (yaml.trim() === "") {
    return [];
  }

  const parsed = parse(yaml);
  return z.array(verifiedAnswerSpecSchema).parse(parsed);
};
