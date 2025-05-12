import "dotenv/config";
import { createConfig } from "../config";
import type { SomeArtifact } from "../artifact";
import {
  assertEnvVars,
  CORE_OPENAI_CONNECTION_ENV_VARS,
} from "mongodb-rag-core";
import { makeStandardConfigMethods } from "./helpers";
import {
  makeGitHubApiClient,
  makeGitHubReleaseArtifacts,
} from "../github/github-api";
import { makeJiraApiClient, makeJiraReleaseArtifacts } from "../jira/jira-api";
import { stripIndents } from "common-tags";

const {
  OPENAI_API_KEY,
  OPENAI_ENDPOINT,
  OPENAI_API_VERSION,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  GITHUB_ACCESS_TOKEN,
  JIRA_USERNAME,
  JIRA_PASSWORD,
} = assertEnvVars({
  ...CORE_OPENAI_CONNECTION_ENV_VARS,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT: "",
  GITHUB_ACCESS_TOKEN: "",
  JIRA_USERNAME: "",
  JIRA_PASSWORD: "",
});

export default createConfig({
  llmMaxConcurrency: 4,
  project: {
    name: "MongoDB Atlas CLI",
    description: stripIndents`
      The MongoDB Atlas CLI (atlas) allows you to manage your MongoDB Atlas
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
  ...makeStandardConfigMethods({
    azureOpenAi: {
      apiKey: OPENAI_API_KEY,
      endpoint: OPENAI_ENDPOINT,
      apiVersion: OPENAI_API_VERSION,
      chatCompletionDeployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
    },
    logger: {
      namespace: "atlas-cli",
      outputDir: "./logs/atlas-cli",
    },
  }),
  fetchArtifacts: async (version): Promise<SomeArtifact[]> => {
    if (!version.previous) {
      throw new Error("Previous version is required");
    }
    const github = makeGitHubReleaseArtifacts({
      githubApi: makeGitHubApiClient({
        authToken: GITHUB_ACCESS_TOKEN,
      }),
      owner: "mongodb",
      repo: "mongodb-atlas-cli",
      version: `atlascli/v${version.current}`,
      previousVersion: `atlascli/v${version.previous}`,
    });
    const jira = makeJiraReleaseArtifacts({
      jiraApi: makeJiraApiClient({
        username: JIRA_USERNAME,
        password: JIRA_PASSWORD,
      }),
      project: "CLOUDP",
      version: `atlascli-${version.current}`,
    });

    return Array<SomeArtifact>().concat(
      await github.getCommits(),
      await jira.getIssues(),
    );
  },
});
