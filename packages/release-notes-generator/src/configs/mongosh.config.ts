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
    name: "MongoDB Shell",
    description: stripIndents`
      The MongoDB Shell (mongosh) allows you to interact with MongoDB deployments from your terminal applications.
      It uses a familar JavaScript API that lets you work with your databases and collections, including:

      - CRUD and aggregation operations
      - Index creation and management
      - Database administration commands

      The Atlas CLI is designed for both interactive use and automation through scripts and CI/CD pipelines.
      It can connect to any MongoDB deployment, including MongoDB Atlas clusters, self-managed deployments, and local instances.`,
  },
  ...makeStandardConfigMethods({
    azureOpenAi: {
      apiKey: OPENAI_API_KEY,
      endpoint: OPENAI_ENDPOINT,
      apiVersion: OPENAI_API_VERSION,
      chatCompletionDeployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
    },
    logger: {
      namespace: "mongosh",
      outputDir: "./logs/mongosh",
    },
  }),
  fetchArtifacts: async (version): Promise<SomeArtifact[]> => {
    const github = makeGitHubReleaseArtifacts({
      githubApi: makeGitHubApiClient({
        authToken: GITHUB_ACCESS_TOKEN,
      }),
      owner: "mongodb-js",
      repo: "mongosh",
      version: `v${version.current}`,
      previousVersion: `v${version.previous}`,
    });
    const jira = makeJiraReleaseArtifacts({
      jiraApi: makeJiraApiClient({
        username: JIRA_USERNAME,
        password: JIRA_PASSWORD,
      }),
      project: "MONGOSH",
      version: version.current,
    });

    return Array<SomeArtifact>().concat(
      await github.getCommits(),
      await jira.getIssues(),
    );
  },
});
