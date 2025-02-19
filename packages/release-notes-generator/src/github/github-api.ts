import { Octokit } from "@octokit/rest";
import type { GitCommitArtifact, GitDiffArtifact } from "./artifacts";
import { makeGitCommitArtifact, makeGitDiffArtifact } from "./artifacts";
import { splitDiff } from "./splitDiff";
import { z } from "zod";

export type MakeGitHubApiClientArgs = {
  authToken: string;
};

export const makeGitHubApiClient = ({
  authToken,
}: MakeGitHubApiClientArgs): Octokit => {
  return new Octokit({
    auth: authToken,
  });
};

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
      "The version of the release. This (naïvely) corresponds to a git tag.",
    ),
  previousVersion: z
    .string()
    .describe(
      "The previous version of the release. This (naïvely) corresponds to a git tag.",
    ),
});

export type GitHubReleaseInfo = z.infer<typeof GitHubReleaseInfo>;

export type MakeGitHubReleaseArtifactsArgs = GitHubReleaseInfo &
  (
    | {
        /**
         A GitHub API client from Octokit
        */
        githubApi: Octokit;
      }
    | {
        /**
         A GitHub API client from Octokit
        */
        githubApiClientArgs: MakeGitHubApiClientArgs;
      }
  );

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

type GitHubError = {
  status: number;
  response?: {
    headers: {
      "retry-after"?: string;
    };
  };
};

// Simple rate limit handler with retries
async function withRateLimit<T>(
  operation: () => Promise<T>,
  retryCount = 0,
): Promise<T> {
  try {
    const result = await operation();
    return result;
  } catch (error: unknown) {
    const gitHubError = error as GitHubError;
    if (
      gitHubError.status === 403 &&
      gitHubError.response?.headers?.["retry-after"] &&
      retryCount < 3
    ) {
      const retryAfter =
        parseInt(gitHubError.response.headers["retry-after"], 10) || 1;
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
  args: MakeGitHubReleaseArtifactsArgs,
): GitHubReleaseArtifacts {
  const githubApi =
    "githubApi" in args
      ? args.githubApi
      : makeGitHubApiClient(args.githubApiClientArgs);
  // Helper function to fetch the comparison between two versions
  const fetchVersionComparison = async (): ReturnType<
    typeof githubApi.repos.compareCommitsWithBasehead
  > => {
    return withRateLimit(() =>
      githubApi.repos.compareCommitsWithBasehead({
        owner: args.owner,
        repo: args.repo,
        basehead: `${args.previousVersion}...${args.version}`,
      }),
    );
  };

  // Cache the version comparison to avoid duplicate API calls
  let versionComparisonPromise: Promise<
    Awaited<
      ReturnType<typeof githubApi.repos.compareCommitsWithBasehead>
    >["data"]
  > | null = null;

  // Cache for detailed commit information to avoid rate limiting
  const commitDetailPromises = new Map<
    string,
    Promise<Awaited<ReturnType<typeof githubApi.repos.getCommit>>["data"]>
  >();

  // Helper function to fetch detailed commit information with rate limiting
  const fetchCommitDetails = async (
    commitSha: string,
  ): Promise<
    Awaited<ReturnType<typeof githubApi.repos.getCommit>>["data"] | undefined
  > => {
    if (!commitDetailPromises.has(commitSha)) {
      const commitPromise = withRateLimit(() =>
        githubApi.repos.getCommit({
          owner: args.owner,
          repo: args.repo,
          ref: commitSha,
        }),
      );
      commitDetailPromises.set(
        commitSha,
        commitPromise.then((response) => response.data),
      );
    }
    return commitDetailPromises.get(commitSha);
  };

  return {
    getCommits: async (): Promise<GitCommitArtifact[]> => {
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
          batch.map((commit) => fetchCommitDetails(commit.sha)),
        );
        const filteredBatchResults = batchResults.filter(
          (commit) => commit !== undefined,
        );
        detailedCommits.push(...filteredBatchResults);

        // Add a small delay between batches if there are more to process
        if (i + batchSize < versionData.commits.length) {
          await delay(1000); // 1 second delay between batches
        }
      }

      // Convert the commits into artifacts
      return detailedCommits.map((commit) =>
        makeGitCommitArtifact({
          id: `${args.owner}/${args.repo}/${commit.sha}`,
          data: {
            hash: commit.sha,
            message: commit.commit.message,
            title: commit.commit.message,
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
        }),
      );
    },
    getDiffs: async (): Promise<GitDiffArtifact[]> => {
      // Fetch the diffs between the previous version and the current version
      const { data } = await withRateLimit(() =>
        githubApi.repos.compareCommitsWithBasehead({
          owner: args.owner,
          repo: args.repo,
          basehead: `${args.previousVersion}...${args.version}`,
          headers: {
            accept: "application/vnd.github.v3.diff",
          },
        }),
      );

      // Octokit doesn't have typings for the diff response. When you
      // pass the diff header, the response body is a string (i.e. the
      // diff) not a structured object.
      const fullDiff = data as unknown as string;

      const artifacts = splitDiff(fullDiff).map(({ fileName, diff }) =>
        makeGitDiffArtifact({
          id: `${args.owner}/${args.repo}/${fileName}`,
          data: {
            oldHash: args.previousVersion,
            newHash: args.version,
            fileName,
            diff,
          },
        }),
      );

      return artifacts;
    },
    getJiraIssueKeys: async (jiraProject): Promise<string[]> => {
      // Use cached version comparison if available
      versionComparisonPromise =
        versionComparisonPromise ||
        fetchVersionComparison().then((response) => response.data);
      const versionData = await versionComparisonPromise;

      const jiraIssues = versionData.commits
        .map((commit) =>
          extractJiraIssueKeys(jiraProject, commit.commit.message),
        )
        .flat();

      return [...new Set(jiraIssues)];
    },
  };
}
