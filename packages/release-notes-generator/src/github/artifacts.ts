import { makeArtifact, type Artifact } from "../Artifact";

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

export type GitCommitArtifact = Artifact<"git-commit", GitCommit>;

export function makeGitCommitArtifact(args: {
  id: string;
  data: GitCommit;
  summary?: string;
}): GitCommitArtifact {
  return makeArtifact({
    id: args.id,
    type: "git-commit",
    data: args.data,
    summary: args.summary,
  });
}

export function getGitCommitIdentifier(artifact: GitCommitArtifact): string {
  return `${artifact.type}::${artifact.data.hash}`;
}

export function getCondensedGitCommit(artifact: GitCommitArtifact) {
  return {
    id: artifact.id,
    type: artifact.type,
    summary: artifact.summary ?? "No summary provided",
    hash: artifact.data.hash,
    title: artifact.data.title,
  };
}
