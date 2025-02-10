import { createConfig } from "./config";
import {
  makeGitCommitArtifact,
  type GitCommitArtifact,
} from "./github/artifacts";
import {
  createMultiLogger,
  createConsoleLogger,
  createFileLogger,
} from "./logger";
import * as path from "path";

// Create a timestamp for the log filename
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const logFilename = `atlas-cli-release-notes-${timestamp}.jsonl`;

// Create a logger that writes to both console and file
const logger = createMultiLogger([
  createConsoleLogger(),
  createFileLogger(path.join("logs", logFilename)),
]);

export default createConfig({
  project: {
    name: "MongoDB Atlas CLI",
    description: `The MongoDB Atlas CLI (atlas) allows you to manage your MongoDB Atlas
database deployments from the command line. It provides a complete set of
functionality to:

- Create and manage database deployments
- Configure database users and network access
- Load sample data and run performance tests
- Monitor deployment metrics and logs
- Manage backups and restore points
- And much more...

The Atlas CLI is designed for both interactive use and automation through
scripts and CI/CD pipelines. It provides a consistent interface to Atlas
across all supported platforms and environments.`,
  },
  logger,
  fetchArtifacts: async (_version) => {
    // const githubArtifacts = await fetchGithubArtifacts(version);
    // const jiraArtifacts = await fetchJiraArtifacts(version);
    // return [...githubArtifacts, ...jiraArtifacts];
    const githubArtifacts: GitCommitArtifact[] = [
      makeGitCommitArtifact({
        id: "123456",
        data: {
          title: "Fix a bug",
          hash: "123456",
          message: "Fix a bug in the CLI",
          files: [
            {
              fileName: "src/index.ts",
              additions: 1,
              deletions: 1,
              changes: 2,
              hash: "123456",
              status: "modified",
            },
          ],
        },
      }),
    ];
    return [...githubArtifacts];
  },
  summarizeArtifact: async (artifact) => {
    // TODO: Implement this with AI
    switch (artifact.type) {
      case "git-commit":
        return `This is a git commit with identifier: ${artifact.type}::${artifact.id}`;
      case "jira-issue":
        return `This is a Jira issue with identifier: ${artifact.type}::${artifact.id}`;
      default:
        throw new Error(`Unknown artifact type: ${artifact.type}`);
    }
  },
  extractChanges: async (_artifact) => {
    return [
      {
        description:
          "Fixes a bug where whizbanging before cobbling would cause a crash",
      },
      {
        description:
          "Adds a new feature that lets you cobble the sprockets in parallel",
      },
    ];
  },
  classifyChange: async (change) => {
    const changeType = change.description.includes("Fix")
      ? "fixed"
      : change.description.includes("Add")
      ? "added"
      : "updated";
    return {
      audience: "external",
      type: changeType,
    };
  },
  filterChange: (change) => {
    return change.classification.audience === "external";
  },
});
