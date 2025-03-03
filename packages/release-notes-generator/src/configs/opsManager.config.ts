import "dotenv/config";
import { createConfig } from "../config";
import type { SomeArtifact } from "../artifact";
import {
  assertEnvVars,
  CORE_OPENAI_CONNECTION_ENV_VARS,
} from "mongodb-rag-core";
import { makeStandardConfigMethods } from "./helpers";
import { makeJiraApiClient, makeJiraReleaseArtifacts } from "../jira/jira-api";
import { stripIndents } from "common-tags";

const {
  OPENAI_API_KEY,
  OPENAI_ENDPOINT,
  OPENAI_API_VERSION,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
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
    name: "MongoDB Ops Manager",
    description: stripIndents`
      MongoDB Ops Manager is a self-hosted management platform that enables you to deploy, monitor, back up, and scale MongoDB on your own infrastructure.

      - Ops Manager Automation enables you to configure and maintain MongoDB nodes and clusters.
      - Ops Manager Monitoring provides real-time reporting, visualization, and alerting on key database and hardware indicators.
      - Ops Manager Backup provides scheduled snapshots and point-in-time recovery of your MongoDB replica sets and sharded clusters.
    `,
  },
  ...makeStandardConfigMethods({
    azureOpenAi: {
      apiKey: OPENAI_API_KEY,
      endpoint: OPENAI_ENDPOINT,
      apiVersion: OPENAI_API_VERSION,
      chatCompletionDeployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
    },
    logger: {
      namespace: "opsManager",
      outputDir: "./logs/opsManager",
    },
  }),
  fetchArtifacts: async (version): Promise<SomeArtifact[]> => {
    const jira = makeJiraReleaseArtifacts({
      jiraApi: makeJiraApiClient({
        username: JIRA_USERNAME,
        password: JIRA_PASSWORD,
      }),
      project: "CLOUDP",
      version: `v${version.current}`,
    });

    return Array<SomeArtifact>().concat(await jira.getIssues());
  },
});
