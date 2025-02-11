import type JiraApi from "jira-client";
import { makeJiraReleaseArtifacts } from "./jira-api";
import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";

// Mock data
const mockJiraIssue = {
  expand:
    "operations,versionedRepresentations,editmeta,changelog,renderedFields",
  id: "123456",
  self: "https://jira.mongodb.org/rest/api/2/issue/123456",
  key: "CLOUDP-247010",
  fields: {
    fixVersions: [
      {
        self: "https://jira.mongodb.org/rest/api/2/version/123",
        id: "123",
        name: "atlascli-1.22.0",
        archived: false,
        released: true,
      },
    ],
    components: [
      {
        self: "https://jira.mongodb.org/rest/api/2/component/456",
        id: "456",
        name: "Atlas CLI",
      },
    ],
    resolution: {
      self: "https://jira.mongodb.org/rest/api/2/resolution/1",
      id: "1",
      description: "A fix for this issue has been implemented",
      name: "Fixed",
    },
    priority: {
      self: "https://jira.mongodb.org/rest/api/2/priority/2",
      iconUrl: "https://jira.mongodb.org/images/icons/priorities/high.svg",
      name: "High",
      id: "2",
    },
    summary: "Test issue summary",
    description: "Test issue description",
    status: {
      self: "https://jira.mongodb.org/rest/api/2/status/6",
      description: "The issue is considered finished",
      name: "Closed",
      id: "6",
      iconUrl: "https://jira.mongodb.org/images/icons/statuses/closed.png",
    },
    issuetype: {
      self: "https://jira.mongodb.org/rest/api/2/issuetype/3",
      id: "3",
      description: "A task that needs to be done.",
      iconUrl: "https://jira.mongodb.org/images/icons/issuetypes/task.svg",
      name: "Task",
      subtask: false,
      avatarId: 1,
    },
    project: {
      self: "https://jira.mongodb.org/rest/api/2/project/CLOUDP",
      id: "789",
      key: "CLOUDP",
      name: "Cloud Platform",
      projectTypeKey: "software",
    },
  },
};

const mockSearchResponse = {
  expand: "schema,names",
  startAt: 0,
  maxResults: 100,
  total: 1,
  issues: [mockJiraIssue],
};

describe("makeJiraReleaseArtifacts", () => {
  let mockJiraApi: {
    searchJira: Mock;
  };

  beforeEach(() => {
    mockJiraApi = {
      searchJira: vi.fn(),
    };
  });

  it("fetches and processes issues correctly with version", async () => {
    // Setup mock
    mockJiraApi.searchJira.mockResolvedValueOnce(mockSearchResponse);

    const jiraReleaseArtifacts = makeJiraReleaseArtifacts({
      jiraApi: mockJiraApi as unknown as JiraApi,
      project: "CLOUDP",
      version: "atlascli-1.22.0",
    });

    const issues = await jiraReleaseArtifacts.getIssues();

    expect(issues).toHaveLength(1);
    expect(issues[0].type).toBe("jira-issue");
    expect(issues[0].data.key).toBe("CLOUDP-247010");
    expect(issues[0].data.summary).toBe("Test issue summary");
    expect(issues[0].data.status).toBe("Closed");
    expect(issues[0].data.resolution).toBe("Fixed");
    expect(issues[0].data.components).toEqual(["Atlas CLI"]);
    expect(issues[0].data.fixVersions).toEqual(["atlascli-1.22.0"]);
  });

  it("fetches and processes issues correctly with issue keys", async () => {
    // Setup mock
    mockJiraApi.searchJira.mockResolvedValueOnce(mockSearchResponse);

    const jiraReleaseArtifacts = makeJiraReleaseArtifacts({
      jiraApi: mockJiraApi as unknown as JiraApi,
      issueKeys: ["CLOUDP-247010"],
    });

    const issues = await jiraReleaseArtifacts.getIssues();

    expect(issues).toHaveLength(1);
    expect(issues[0].type).toBe("jira-issue");
    expect(issues[0].data.key).toBe("CLOUDP-247010");
  });

  it("fetches and processes issues correctly with JQL query", async () => {
    // Setup mock
    mockJiraApi.searchJira.mockResolvedValueOnce(mockSearchResponse);

    const jiraReleaseArtifacts = makeJiraReleaseArtifacts({
      jiraApi: mockJiraApi as unknown as JiraApi,
      query: "project = CLOUDP AND fixVersion = atlascli-1.22.0",
    });

    const issues = await jiraReleaseArtifacts.getIssues();

    expect(issues).toHaveLength(1);
    expect(issues[0].type).toBe("jira-issue");
    expect(issues[0].data.key).toBe("CLOUDP-247010");
  });

  it("handles pagination correctly", async () => {
    // Setup mock to simulate two pages of results
    const page1 = { ...mockSearchResponse, total: 2 };
    const page2 = {
      ...mockSearchResponse,
      startAt: 1,
      issues: [
        {
          ...mockJiraIssue,
          key: "CLOUDP-247011",
        },
      ],
    };

    mockJiraApi.searchJira
      .mockResolvedValueOnce(page1)
      .mockResolvedValueOnce(page2);

    const jiraReleaseArtifacts = makeJiraReleaseArtifacts({
      jiraApi: mockJiraApi as unknown as JiraApi,
      project: "CLOUDP",
      version: "atlascli-1.22.0",
    });

    const issues = await jiraReleaseArtifacts.getIssues();

    expect(issues).toHaveLength(2);
    expect(issues[0].data.key).toBe("CLOUDP-247010");
    expect(issues[1].data.key).toBe("CLOUDP-247011");
  });
});
