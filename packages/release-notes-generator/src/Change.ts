import { Artifact } from "./Artifact";

export type Change = {
  description: string;
  sourceIdentifier?: string;
};

export type SomeClassification = Record<string, unknown>;

export type ChangelogClassification = {
  audience: "internal" | "external";
  type: "added" | "updated" | "fixed" | "deprecated" | "removed" | "security";
};

export type ClassifiedChange<Classification extends SomeClassification> =
  Change & {
    classification: Classification;
  };

export function artifactWithChanges<
  C extends SomeClassification,
  A extends Artifact<string, unknown, C>
>(artifact: A, changes: ClassifiedChange<C>[]) {
  return {
    ...artifact,
    changes,
  };
}

export function changeWithClassification<
  Classification extends SomeClassification
>(
  change: Change,
  classification: Classification
): ClassifiedChange<Classification> {
  return {
    ...change,
    classification,
  };
}
