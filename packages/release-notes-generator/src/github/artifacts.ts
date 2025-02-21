import { artifactSchema } from "../artifact";
import { z } from "zod";

export const gitCommitSchema = z.object({
  hash: z.string(),
  title: z.string(),
  message: z.string(),
  files: z.array(
    z.object({
      fileName: z.string(),
      additions: z.number(),
      deletions: z.number(),
      changes: z.number(),
      hash: z.string(),
      status: z.string(),
    }),
  ),
});

export type GitCommit = z.infer<typeof gitCommitSchema>;

export const gitCommitArtifactSchema = artifactSchema(
  "git-commit",
  gitCommitSchema,
);

export type GitCommitArtifact = z.infer<typeof gitCommitArtifactSchema>;

export function makeGitCommitArtifact(args: {
  id: string;
  data: GitCommit;
  summary?: string;
}): GitCommitArtifact {
  return gitCommitArtifactSchema.parse({
    id: args.id,
    type: "git-commit",
    data: args.data,
    summary: args.summary,
  });
}

export function getGitCommitIdentifier(artifact: GitCommitArtifact): string {
  return `${artifact.type}::${artifact.data.hash}`;
}

export type CondensedGitCommit = {
  id: string;
  type: string;
  summary: string;
  hash: string;
  title: string;
};

export function getCondensedGitCommit(
  artifact: GitCommitArtifact,
): CondensedGitCommit {
  return {
    id: artifact.id,
    type: artifact.type,
    summary: artifact.summary ?? "No summary provided",
    hash: artifact.data.hash,
    title: artifact.data.title,
  };
}

export const gitDiffSchema = z.object({
  oldHash: z.string(),
  newHash: z.string(),
  fileName: z.string(),
  diff: z.string(),
});

export type GitDiff = z.infer<typeof gitDiffSchema>;

export const gitDiffArtifactSchema = artifactSchema("git-diff", gitDiffSchema);

export type GitDiffArtifact = z.infer<typeof gitDiffArtifactSchema>;

export function makeGitDiffArtifact(args: {
  id: string;
  data: GitDiff;
}): GitDiffArtifact {
  return gitDiffArtifactSchema.parse({
    id: args.id,
    type: "git-diff",
    data: args.data,
  });
}

export function getGitDiffIdentifier(artifact: GitDiffArtifact): string {
  return `${artifact.type}::${artifact.data.fileName}`;
}

export type CondensedGitDiff = {
  id: string;
  type: string;
  summary: string;
  fileName: string;
  oldHash: string;
  newHash: string;
};

export function getCondensedGitDiff(
  artifact: GitDiffArtifact,
): CondensedGitDiff {
  return {
    id: artifact.id,
    type: artifact.type,
    summary: artifact.summary ?? "No summary provided",
    fileName: artifact.data.fileName,
    oldHash: artifact.data.oldHash,
    newHash: artifact.data.newHash,
  };
}
