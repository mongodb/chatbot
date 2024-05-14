import "dotenv/config";
import { makeJiraReleaseArtifacts } from "./jira";

import { standardConfig } from "../standardConfig";
import { JiraIssueArtifact } from "./projects";

const jiraApi = standardConfig.jiraApi?.();

if (!jiraApi) {
  throw new Error(
    "githubApi is required. Make sure to define it in the config."
  );
}

describe("makeJiraReleaseArtifacts", () => {
  it("returns a handle that can fetch issues", async () => {
    const gitHubReleaseArtifacts = makeJiraReleaseArtifacts({
      jiraApi,
      project: "CLOUDP",
      version: "atlascli-1.22.0",
    });
    const issues = await gitHubReleaseArtifacts.getIssues();
    expect(issues.length).toBeGreaterThan(0);
    const firstIssue = issues[0] as JiraIssueArtifact;
    expect(firstIssue.type).toEqual("jira-issue");
    expect(firstIssue.data.key).toEqual("CLOUDP-247010");
  });
});
