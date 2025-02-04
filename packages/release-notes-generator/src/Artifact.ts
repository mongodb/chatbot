import { type ClassifiedChange, type SomeClassification } from "./Change";

export type ArtifactConstructorArgs<
  T extends string,
  D,
  C extends SomeClassification
> = {
  id: string;
  type: T;
  summary?: string;
  changes?: ClassifiedChange<C>[];
  data: D;
  metadata?: Record<string, unknown>;
};

export abstract class Artifact<
  T extends string,
  D,
  C extends SomeClassification
> {
  /**
   A unique identifier for the artifact.
   */
  id: string;

  /**
   The type of the artifact.
   */
  type: T;

  /**
   The data contained in the artifact.
   */
  data: D;

  /**
   A human-readable summary of the artifact. Defined by setting the `summary` property.
   */
  summary?: string;

  /**
   The changes associated with the artifact.
   */
  changes: ClassifiedChange<C>[];

  /**
   Additional metadata associated with the artifact.
   */
  metadata?: Record<string, unknown>;

  constructor(args: ArtifactConstructorArgs<T, D, C>) {
    this.id = args.id;
    this.type = args.type;
    this.summary = args.summary;
    this.changes = args.changes ?? [];
    this.data = args.data;
    this.metadata = args.metadata;
  }

  identifier() {
    return `${this.type}::${this.id}`;
  }

  /**
   Returns a condensed version of the artifact that can be used in a human readable format.

   For example, for a Git commit artifact, this might contain the commit hash
   and title but omit the commit message and/or the full diff.
   */
  condensed(): Required<Pick<Artifact<T, D, C>, "id" | "type" | "summary">> &
    Record<string, unknown> {
    return {
      id: this.id,
      type: this.type,
      summary: this.summary ?? "No summary provided",
    };
  }
}

export type SomeArtifact = Artifact<string, unknown, SomeClassification>;

/**
 An artifact that represents a group of other related artifacts.
 */
export class ArtifactGroup extends Artifact<
  "group",
  { artifacts: SomeArtifact[] },
  SomeClassification
> {
  constructor(args: { id: string; artifacts: SomeArtifact[] }) {
    super({
      id: args.id,
      type: "group",
      data: { artifacts: args.artifacts },
    });
  }

  condensed() {
    return {
      ...super.condensed(),
      artifacts: this.data.artifacts.map((artifact) => artifact.condensed()),
    };
  }
}
