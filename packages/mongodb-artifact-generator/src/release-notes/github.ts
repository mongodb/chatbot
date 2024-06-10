// An interface that lets you connect to GitHub and fetch artifacts

import { Octokit } from "@octokit/rest";
import { GitCommitArtifact, GitDiffArtifact } from "./projects";
import { splitDiff } from "./splitDiff";
import { z } from "zod";

// relevant to a given release.
export type GitHubReleaseArtifacts = {
  /**
   Fetches the commits between the previous version and the current version.
   */
  getCommits(): Promise<GitCommitArtifact[]>;

  /**
   Fetches the diffs between the previous version and the current version.
   */
  getDiffs(): Promise<GitDiffArtifact[]>;
};

export const GitHubReleaseInfo = z.object({
  owner: z.string().describe("The owner of the repository."),
  repo: z.string().describe("The repository name."),
  version: z
    .string()
    .describe(
      "The version of the release. This (naïvely) corresponds to a git tag."
    ),
  previousVersion: z
    .string()
    .describe(
      "The previous version of the release. This (naïvely) corresponds to a git tag."
    ),
});

export type GitHubReleaseInfo = z.infer<typeof GitHubReleaseInfo>;

export type MakeGitHubReleaseArtifactsArgs = GitHubReleaseInfo & {
  /**
   A GitHub API client from Octokit
   */
  githubApi: Octokit;
};

export function makeGitHubReleaseArtifacts(
  args: MakeGitHubReleaseArtifactsArgs
): GitHubReleaseArtifacts {
  return {
    getCommits: async () => {
      // Fetch the commits between the previous version and the current version
      const { data } = await args.githubApi.repos.compareCommitsWithBasehead({
        owner: args.owner,
        repo: args.repo,
        basehead: `${args.previousVersion}...${args.version}`,
      });

      // Get details for each commit
      const commits = await Promise.all(
        data.commits.map(async (commit) => {
          const { data } = await args.githubApi.repos.getCommit({
            owner: args.owner,
            repo: args.repo,
            ref: commit.sha,
          });

          return data;
        })
      );

      // Convert the commits into artifacts
      return commits.map((commit) => ({
        type: "git-commit",
        data: {
          hash: commit.sha,
          message: commit.commit.message,
          files:
            commit.files?.map((file) => {
              return {
                fileName: file.filename,
                additions: file.additions,
                deletions: file.deletions,
                changes: file.changes,
                hash: file.sha,
                status: file.status,
                patch: file.patch,
              };
            }) ?? [],
        },
      }));
    },
    getDiffs: async () => {
      // Fetch the diffs between the previous version and the current version
      const { data } = await args.githubApi.repos.compareCommitsWithBasehead({
        owner: args.owner,
        repo: args.repo,
        basehead: `${args.previousVersion}...${args.version}`,
        headers: {
          accept: "application/vnd.github.v3.diff",
        },
      });

      // Octokit doesn't have typings for the diff response. When you
      // pass the diff header, the response body is a string (i.e. the
      // diff) not a structured object.
      const fullDiff = data as unknown as string;

      const artifacts = splitDiff(fullDiff).map(
        ({ fileName, diff }) =>
          ({
            type: "git-diff",
            data: {
              oldHash: args.previousVersion,
              newHash: args.version,
              fileName,
              diff,
            },
          } satisfies GitDiffArtifact)
      );

      return artifacts;
    },
  };
}
