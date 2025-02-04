import { type ClassifiedChange, type ChangelogClassification } from "./Change";

export type ArtifactArgs<T extends string, D> = {
  id: string;
  type: T;
  summary?: string;
  changes?: ClassifiedChange[];
  data: D;
  metadata?: Record<string, unknown>;
};

export type Artifact<T extends string, D> = {
  /** A unique identifier for the artifact. */
  id: string;
  /** The type of the artifact. */
  type: T;
  /** The data contained in the artifact. */
  data: D;
  /** A human-readable summary of the artifact. */
  summary?: string;
  /** The changes associated with the artifact. */
  changes: ClassifiedChange[];
  /** Additional metadata associated with the artifact. */
  metadata?: Record<string, unknown>;
};

export function makeArtifact<T extends string, D>(
  args: ArtifactArgs<T, D>
): Artifact<T, D> {
  return {
    id: args.id,
    type: args.type,
    summary: args.summary,
    changes: args.changes ?? [],
    data: args.data,
    metadata: args.metadata,
  };
}

export function getArtifactIdentifier<T extends string, D>(
  artifact: Artifact<T, D>
): string {
  return `${artifact.type}::${artifact.id}`;
}

export function getCondensedArtifact<T extends string, D>(
  artifact: Artifact<T, D>
): Required<Pick<Artifact<T, D>, "id" | "type" | "summary">> &
  Record<string, unknown> {
  return {
    id: artifact.id,
    type: artifact.type,
    summary: artifact.summary ?? "No summary provided",
  };
}

export type SomeArtifact = Artifact<string, unknown>;

export type ArtifactGroup = Artifact<"group", { artifacts: SomeArtifact[] }>;

export function makeArtifactGroup(args: {
  id: string;
  artifacts: SomeArtifact[];
}): ArtifactGroup {
  return makeArtifact({
    id: args.id,
    type: "group",
    data: { artifacts: args.artifacts },
  });
}

export function getCondensedArtifactGroup(group: ArtifactGroup) {
  return {
    ...getCondensedArtifact(group),
    artifacts: group.data.artifacts.map(getCondensedArtifact),
  };
}
