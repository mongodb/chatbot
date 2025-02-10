import { makeArtifact, createArtifactSchema } from "../artifact";
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
    })
  ),
});

export type GitCommit = z.infer<typeof gitCommitSchema>;

export const gitCommitArtifactSchema = createArtifactSchema(
  z.literal("git-commit"),
  gitCommitSchema
);

export type GitCommitArtifact = z.infer<typeof gitCommitArtifactSchema>;

export function makeGitCommitArtifact(args: {
  id: string;
  data: GitCommit;
  summary?: string;
}): GitCommitArtifact {
  return makeArtifact(
    {
      id: args.id,
      type: "git-commit",
      data: args.data,
      summary: args.summary,
    },
    gitCommitArtifactSchema
  );
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
