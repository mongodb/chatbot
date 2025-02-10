import { Artifact } from "../artifact";

export class GitCommitArtifact extends Artifact<
  "git-commit",
  {
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
  }
> {
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

const g = new GitCommitArtifact({
  id: "123",
  type: "git-commit",
  data: {
    hash: "123",
    title: "Initial commit",
    message: "",
    files: [],
  },
  metadata: {},
});
