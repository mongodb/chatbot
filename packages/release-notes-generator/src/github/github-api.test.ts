import type { Octokit } from "@octokit/rest";
import { makeGitHubReleaseArtifacts } from "./github-api";
import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";

// Mock data
const mockCommitResponse = {
  data: {
    sha: "abc123",
    commit: {
      message: "feat: Add new feature JIRA-123",
    },
    files: [
      {
        filename: "src/test.ts",
        additions: 10,
        deletions: 5,
        changes: 15,
        sha: "file123",
        status: "modified",
        patch: "@@ -1,5 +1,10 @@\n Some patch content",
      },
    ],
  },
};

const mockComparisonResponse = {
  data: {
    commits: [
      {
        sha: "abc123",
        commit: {
          message: "feat: Add new feature JIRA-123",
        },
      },
      {
        sha: "def456",
        commit: {
          message: "fix: Fix bug JIRA-456",
        },
      },
    ],
  },
};

const mockDiffResponse = {
  data: `diff --git a/src/test.ts b/src/test.ts
index abc..def 100644
--- a/src/test.ts
+++ b/src/test.ts
@@ -1,5 +1,10 @@
 Some test content
+Added line`,
};

describe("makeGitHubReleaseArtifacts", () => {
  let mockGithubApi: {
    repos: {
      compareCommitsWithBasehead: Mock;
      getCommit: Mock;
    };
  };

  beforeEach(() => {
    mockGithubApi = {
      repos: {
        compareCommitsWithBasehead: vi.fn(),
        getCommit: vi.fn(),
      },
    };
  });

  it("fetches and processes commits correctly", async () => {
    // Setup mocks
    mockGithubApi.repos.compareCommitsWithBasehead.mockResolvedValueOnce(
      mockComparisonResponse,
    );
    mockGithubApi.repos.getCommit
      .mockResolvedValueOnce(mockCommitResponse)
      .mockResolvedValueOnce({
        data: {
          ...mockCommitResponse.data,
          sha: "def456",
          commit: { message: "fix: Fix bug JIRA-456" },
        },
      });

    const gitHubReleaseArtifacts = makeGitHubReleaseArtifacts({
      githubApi: mockGithubApi as unknown as Octokit,
      owner: "mongodb",
      repo: "chatbot",
      version: "v0.4.0",
      previousVersion: "v0.3.1",
    });

    const commits = await gitHubReleaseArtifacts.getCommits();

    expect(commits).toHaveLength(2);
    expect(commits[0].type).toBe("git-commit");
    const firstCommit = commits[0];
    expect(firstCommit.data.hash).toBe("abc123");
    expect(firstCommit.data.message).toBe("feat: Add new feature JIRA-123");
    expect(firstCommit.data.files).toHaveLength(1);
    expect(firstCommit.data.files[0].fileName).toBe("src/test.ts");
  });

  it("fetches and processes diffs correctly", async () => {
    // Setup mock
    mockGithubApi.repos.compareCommitsWithBasehead.mockResolvedValueOnce(
      mockDiffResponse,
    );

    const gitHubReleaseArtifacts = makeGitHubReleaseArtifacts({
      githubApi: mockGithubApi as unknown as Octokit,
      owner: "mongodb",
      repo: "chatbot",
      version: "v0.4.0",
      previousVersion: "v0.3.1",
    });

    const diffs = await gitHubReleaseArtifacts.getDiffs();

    expect(diffs).toHaveLength(1);
    expect(diffs[0].type).toBe("git-diff");
    const firstDiff = diffs[0];
    expect(firstDiff.data.fileName).toBe("src/test.ts");
    expect(firstDiff.data.diff).toContain("Some test content");
  });

  it("extracts Jira issue keys correctly", async () => {
    // Setup mock
    mockGithubApi.repos.compareCommitsWithBasehead.mockResolvedValueOnce(
      mockComparisonResponse,
    );

    const gitHubReleaseArtifacts = makeGitHubReleaseArtifacts({
      githubApi: mockGithubApi as unknown as Octokit,
      owner: "mongodb",
      repo: "chatbot",
      version: "v0.4.0",
      previousVersion: "v0.3.1",
    });

    const jiraKeys = await gitHubReleaseArtifacts.getJiraIssueKeys("JIRA");

    expect(jiraKeys).toEqual(["JIRA-123", "JIRA-456"]);
    expect(jiraKeys).toHaveLength(2);
  });

  it("handles rate limiting correctly", async () => {
    // Setup mock to simulate rate limiting then success
    const rateLimitError = {
      status: 403,
      response: {
        headers: {
          "retry-after": "1",
        },
      },
    };

    mockGithubApi.repos.compareCommitsWithBasehead
      .mockRejectedValueOnce(rateLimitError)
      .mockResolvedValueOnce(mockComparisonResponse);

    const gitHubReleaseArtifacts = makeGitHubReleaseArtifacts({
      githubApi: mockGithubApi as unknown as Octokit,
      owner: "mongodb",
      repo: "chatbot",
      version: "v0.4.0",
      previousVersion: "v0.3.1",
    });

    const jiraKeys = await gitHubReleaseArtifacts.getJiraIssueKeys("JIRA");
    expect(jiraKeys).toEqual(["JIRA-123", "JIRA-456"]);
  });
});
