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

  /**
   Fetches the Jira Issue Keys mentioned in the message of commits between the previous version and the current version.
   */
  getJiraIssueKeys(jiraProject: string): Promise<string[]>;
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

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

// Simple rate limit handler with retries
async function withRateLimit<T>(
  operation: () => Promise<T>,
  retryCount = 0
): Promise<T> {
  try {
    return await operation();
    // Skipping no-explicit-any is fine because this will be deleted in favor of the release-notes-generator package
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (
      error?.status === 403 &&
      error?.response?.headers?.["retry-after"] &&
      retryCount < 3
    ) {
      const retryAfter =
        parseInt(error.response.headers["retry-after"], 10) || 1;
      console.log(
        `Rate limited. Waiting ${retryAfter} seconds before retry ${
          retryCount + 1
        }/3...`
      );
      await delay(retryAfter * 1000);
      return withRateLimit(operation, retryCount + 1);
    }
    throw error;
  }
}

function extractJiraIssueKeys(jiraProject: string, message: string): string[] {
  const regex = new RegExp(`${jiraProject}-\\d+`, "gi");
  const matches = message.match(regex) || [];
  return matches;
}

export function makeGitHubReleaseArtifacts(
  args: MakeGitHubReleaseArtifactsArgs
): GitHubReleaseArtifacts {
  // Helper function to fetch the comparison between two versions
  const fetchVersionComparison = async () => {
    return withRateLimit(() =>
      args.githubApi.repos.compareCommitsWithBasehead({
        owner: args.owner,
        repo: args.repo,
        basehead: `${args.previousVersion}...${args.version}`,
      })
    );
  };

  // Cache the version comparison to avoid duplicate API calls
  let versionComparisonPromise: Promise<
    Awaited<
      ReturnType<typeof args.githubApi.repos.compareCommitsWithBasehead>
    >["data"]
  > | null = null;

  // Cache for detailed commit information to avoid rate limiting
  const commitDetailPromises = new Map<
    string,
    Promise<Awaited<ReturnType<typeof args.githubApi.repos.getCommit>>["data"]>
  >();

  // Helper function to fetch detailed commit information with rate limiting
  const fetchCommitDetails = async (commitSha: string) => {
    if (!commitDetailPromises.has(commitSha)) {
      const commitPromise = withRateLimit(() =>
        args.githubApi.repos.getCommit({
          owner: args.owner,
          repo: args.repo,
          ref: commitSha,
        })
      );
      commitDetailPromises.set(
        commitSha,
        commitPromise.then((response) => response.data)
      );
    }
    const commitDetailPromise = commitDetailPromises.get(commitSha);
    if (!commitDetailPromise) {
      throw new Error(`No commit details found for ${commitSha}`);
    }
    return commitDetailPromise;
  };

  return {
    getCommits: async () => {
      // Use cached version comparison if available
      versionComparisonPromise =
        versionComparisonPromise ||
        fetchVersionComparison().then((response) => response.data);
      const versionData = await versionComparisonPromise;

      // Get detailed information for each commit using cache
      // Process commits in batches determined by the batchSize defined below
      const batchSize = 5;
      const detailedCommits = [];

      for (let i = 0; i < versionData.commits.length; i += batchSize) {
        const batch = versionData.commits.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map((commit) => fetchCommitDetails(commit.sha))
        );
        detailedCommits.push(...batchResults);

        // Add a small delay between batches if there are more to process
        if (i + batchSize < versionData.commits.length) {
          await delay(1000); // 1 second delay between batches
        }
      }

      // Convert the commits into artifacts
      return detailedCommits.map((commit) => ({
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
      const { data } = await withRateLimit(() =>
        args.githubApi.repos.compareCommitsWithBasehead({
          owner: args.owner,
          repo: args.repo,
          basehead: `${args.previousVersion}...${args.version}`,
          headers: {
            accept: "application/vnd.github.v3.diff",
          },
        })
      );

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
    getJiraIssueKeys: async (jiraProject) => {
      // Use cached version comparison if available
      versionComparisonPromise =
        versionComparisonPromise ||
        fetchVersionComparison().then((response) => response.data);
      const versionData = await versionComparisonPromise;

      const jiraIssues = versionData.commits
        .map((commit) =>
          extractJiraIssueKeys(jiraProject, commit.commit.message)
        )
        .flat();

      return [...new Set(jiraIssues)];
    },
  };
}
