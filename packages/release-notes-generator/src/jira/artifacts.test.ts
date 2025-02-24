import { describe, it, expect } from "vitest";
import {
  jiraIssueSchema,
  makeJiraIssueArtifact,
  getJiraIssueIdentifier,
  getCondensedJiraIssue,
  type JiraIssue,
} from "./artifacts";

const mockJiraIssue: JiraIssue = {
  key: "PROJ-123",
  summary: "Test issue summary",
  description: "Test issue description",
  components: ["Component 1", "Component 2"],
  fixVersions: ["1.0.0", "1.1.0"],
  resolution: "Done",
  priority: "High",
  status: "Closed",
  issuetype: "Bug",
  releaseNotes: "Release notes for PROJ-123",
  docsChangesDescription: "Documentation changes for PROJ-123",
};

describe("jiraIssueSchema", () => {
  it("validates a valid Jira issue", () => {
    expect(() => jiraIssueSchema.parse(mockJiraIssue)).not.toThrow();
  });

  it("allows null description", () => {
    const issueWithNullDesc = { ...mockJiraIssue, description: null };
    expect(() => jiraIssueSchema.parse(issueWithNullDesc)).not.toThrow();
  });

  it("allows null release notes", () => {
    const issueWithNullNotes = { ...mockJiraIssue, releaseNotes: null };
    expect(() => jiraIssueSchema.parse(issueWithNullNotes)).not.toThrow();
  });

  it("allows null docs changes description", () => {
    const issueWithNullDocs = {
      ...mockJiraIssue,
      docsChangesDescription: null,
    };
    expect(() => jiraIssueSchema.parse(issueWithNullDocs)).not.toThrow();
  });

  it("requires all required fields", () => {
    const invalidIssue = {
      key: "PROJ-123",
      // Missing required fields
    };
    expect(() => jiraIssueSchema.parse(invalidIssue)).toThrow();
  });
});

describe("makeJiraIssueArtifact", () => {
  it("creates a valid Jira issue artifact", () => {
    const artifact = makeJiraIssueArtifact({
      id: "test-id",
      data: mockJiraIssue,
    });

    expect(artifact).toEqual({
      id: "test-id",
      type: "jira-issue",
      data: mockJiraIssue,
      changes: [],
    });
  });

  it("throws on invalid data", () => {
    const invalidData = {
      key: "PROJ-123",
      // Missing required fields
    };

    expect(() =>
      makeJiraIssueArtifact({
        id: "test-id",
        data: invalidData as JiraIssue,
      }),
    ).toThrow();
  });
});

describe("getJiraIssueIdentifier", () => {
  it("returns the correct identifier format", () => {
    const artifact = makeJiraIssueArtifact({
      id: "test-id",
      data: mockJiraIssue,
    });

    expect(getJiraIssueIdentifier(artifact)).toBe("jira-issue::PROJ-123");
  });
});

describe("getCondensedJiraIssue", () => {
  it("returns condensed issue with all fields", () => {
    const artifact = makeJiraIssueArtifact({
      id: "test-id",
      data: mockJiraIssue,
    });

    expect(getCondensedJiraIssue(artifact)).toEqual({
      id: "test-id",
      type: "jira-issue",
      summary: "No summary provided",
      key: "PROJ-123",
      status: "Closed",
      issuetype: "Bug",
    });
  });

  it("uses provided summary if available", () => {
    const artifact = makeJiraIssueArtifact({
      id: "test-id",
      data: mockJiraIssue,
    });
    artifact.summary = "Custom summary";

    expect(getCondensedJiraIssue(artifact)).toEqual({
      id: "test-id",
      type: "jira-issue",
      summary: "Custom summary",
      key: "PROJ-123",
      status: "Closed",
      issuetype: "Bug",
    });
  });
});
