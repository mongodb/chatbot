import "dotenv/config";
import { getReleaseArtifacts } from "./getReleaseArtifacts";

import { standardConfig } from "../standardConfig";
import { GitCommitArtifact, JiraIssueArtifact } from "./projects";

const githubApi = standardConfig.githubApi?.();
const jiraApi = standardConfig.jiraApi?.();

if (!githubApi) {
  throw new Error(
    "githubApi is required. Make sure to define it in the config."
  );
}

if (!jiraApi) {
  throw new Error("jiraApi is required. Make sure to define it in the config.");
}

describe("getReleaseArtifacts", () => {
  it("returns no artifacts unless configured", async () => {
    const artifacts = await getReleaseArtifacts({});
    expect(artifacts).toEqual([]);
  });

  it("returns release artifacts from GitHub", async () => {
    const artifacts = await getReleaseArtifacts({
      github: {
        githubApi,
        owner: "mongodb",
        repo: "chatbot",
        version: "mongodb-chatbot-ui-v0.4.0",
        previousVersion: "mongodb-chatbot-ui-v0.3.1",
      },
    });
    expect(artifacts.length).toEqual(2);
    expect(artifacts[0].type).toEqual("git-commit");
    const firstArtifact = artifacts[0] as GitCommitArtifact;
    expect(firstArtifact.data.files.length).toEqual(3);
    expect(firstArtifact.data.hash).toEqual(
      "b94f1f30565738680d78b1115984adf7aa9caf70"
    );
  });

  it("returns release artifacts from Jira", async () => {
    const artifacts = await getReleaseArtifacts({
      jira: {
        jiraApi,
        project: "CLOUDP",
        version: "atlascli-1.22.0",
      },
    });
    expect(artifacts.length).toEqual(10);
    expect(artifacts[0].type).toEqual("jira-issue");
    expect((artifacts[0] as JiraIssueArtifact).data.key).toEqual(
      "CLOUDP-247010"
    );
  });
});
