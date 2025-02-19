import type { SomeArtifact } from "./artifact";
import { z } from "zod";

export const changeSchema = z.object({
  description: z.string(),
  sourceIdentifier: z.string().optional(),
});

export type Change = z.infer<typeof changeSchema>;

export const changelogClassificationSchema = z.object({
  audience: z.enum(["internal", "external"]),
  scope: z.enum([
    "added",
    "updated",
    "fixed",
    "deprecated",
    "removed",
    "security",
  ]),
});

export type ChangelogClassification = z.infer<
  typeof changelogClassificationSchema
>;

export const classifiedChangeSchema = changeSchema.extend({
  classification: changelogClassificationSchema,
});

export type ClassifiedChange = z.infer<typeof classifiedChangeSchema>;

export function artifactWithChanges<A extends SomeArtifact>(
  artifact: A,
  changes: ClassifiedChange[],
): SomeArtifact & { changes: ClassifiedChange[] } {
  return {
    ...artifact,
    changes,
  };
}

export function changeWithClassification(
  change: Change,
  classification: ChangelogClassification,
): ClassifiedChange {
  return classifiedChangeSchema.parse({
    ...change,
    classification,
  });
}
