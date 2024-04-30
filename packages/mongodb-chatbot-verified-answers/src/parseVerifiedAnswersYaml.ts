import { parse } from "yaml";
import { z } from "zod";

/**
  Verified answers as specified in the verified answer yaml.
 */
export const VerifiedAnswerSpec = z.object({
  questions: z.array(z.string()),
  answer: z.string(),
  author_email: z.string(),
  hidden: z.optional(z.boolean()),
  references: z.array(
    z.object({
      url: z.string(),
      title: z.optional(z.string()),
    })
  ),
});

export type VerifiedAnswerSpec = z.infer<typeof VerifiedAnswerSpec>;

export const parseVerifiedAnswerYaml = (yaml: string): VerifiedAnswerSpec[] => {
  if (yaml.trim() === "") {
    return [];
  }

  const parsed = parse(yaml);
  return z.array(VerifiedAnswerSpec).parse(parsed);
};
