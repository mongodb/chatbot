import { Artifact, ArtifactConstructorArgs } from "../Artifact";
import { SomeClassification } from "../Change";

export type GitCommit = {
  hash: string;
  title: string;
  message: string;
  files: {
    fileName: string;
    additions: number;
    deletions: number;
    changes: number;
    hash: string;
    status: string;
  }[];
};

export class GitCommitArtifact extends Artifact<
  "git-commit",
  GitCommit,
  SomeClassification
> {
  constructor(
    args: ArtifactConstructorArgs<"git-commit", GitCommit, SomeClassification>
  ) {
    super(args);
  }

  identifier(): string {
    return `${this.type}::${this.data.hash}`;
  }

  condensed() {
    return {
      ...super.condensed(),
      hash: this.data.hash,
      title: this.data.title,
    };
  }
}
