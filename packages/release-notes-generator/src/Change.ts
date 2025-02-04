import { Artifact } from "./Artifact";

export type Change = {
  description: string;
  sourceIdentifier?: string;
};

export type ChangelogClassification = {
  audience: "internal" | "external";
  type: "added" | "updated" | "fixed" | "deprecated" | "removed" | "security";
};

export type ClassifiedChange = Change & {
  classification: ChangelogClassification;
};

export function artifactWithChanges<A extends Artifact<string, unknown>>(
  artifact: A,
  changes: ClassifiedChange[]
) {
  return {
    ...artifact,
    changes,
  };
}

export function changeWithClassification(
  change: Change,
  classification: ChangelogClassification
): ClassifiedChange {
  return {
    ...change,
    classification,
  };
}
