import "dotenv/config";
import { createConfig } from "./config";
import type { SomeArtifact } from "./artifact";
import {
  createMultiLogger,
  createConsoleLogger,
  createFileLogger,
} from "./logger";
import * as path from "path";
import {
  assertEnvVars,
  CORE_OPENAI_CONNECTION_ENV_VARS,
} from "mongodb-rag-core";
import {
  makeAzureOpenAiClient,
  makeGenerateChatCompletion,
} from "./llm/openai-api";
import { currentTimestamp } from "./utils";
import { makeSummarizeReleaseArtifact } from "./llm/summarizeReleaseArtifacts";
import { makeCreateChangelogEntry } from "./llm/createChangelogEntry";
import { makeClassifyChangelog } from "./llm/classifyChangelog";
import { changelogClassificationSchema } from "./change";
import {
  makeGitHubApiClient,
  makeGitHubReleaseArtifacts,
} from "./github/github-api";
import { makeJiraApiClient, makeJiraReleaseArtifacts } from "./jira/jira-api";

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

// Create a logger that writes to both console and file
const logger = createMultiLogger([
  createConsoleLogger(),
  createFileLogger(
    path.join("logs", `atlas-cli-release-notes-${currentTimestamp()}.jsonl`)
  ),
]);

const openAiClient = makeAzureOpenAiClient({
  apiKey: OPENAI_API_KEY,
  endpoint: OPENAI_ENDPOINT,
  apiVersion: OPENAI_API_VERSION,
});

const generateChatCompletion = makeGenerateChatCompletion({
  openAiClient,
  model: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
});

const summarizeReleaseArtifact = makeSummarizeReleaseArtifact({
  generate: generateChatCompletion,
});

const createChangelogEntry = makeCreateChangelogEntry({
  generate: generateChatCompletion,
});

const classifyChangelog = makeClassifyChangelog({
  openAiClient,
  model: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  logger,
});

function formatVersionGitHub(version: string): string {
  return `atlascli/v${version}`;
}

function formatVersionJira(version: string): string {
  return `atlascli-${version}`;
}

export default createConfig({
  logger,
  llmMaxConcurrency: 4,
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
  fetchArtifacts: async (version): Promise<SomeArtifact[]> => {
    const github = makeGitHubReleaseArtifacts({
      githubApi: makeGitHubApiClient({
        authToken: GITHUB_ACCESS_TOKEN,
      }),
      owner: "mongodb",
      repo: "mongodb-atlas-cli",
      version: formatVersionGitHub(version.current),
      previousVersion: formatVersionGitHub(version.previous),
    });
    const jira = makeJiraReleaseArtifacts({
      jiraApi: makeJiraApiClient({
        username: JIRA_USERNAME,
        password: JIRA_PASSWORD,
      }),
      version: formatVersionJira(version.current),
    });

    const commits = await github.getCommits();
    const issues = await jira.getIssues();
    return Array<SomeArtifact>().concat(commits, issues);
  },
  summarizeArtifact: async ({ project, artifact }) => {
    return summarizeReleaseArtifact({
      artifact,
      projectDescription: project.description,
    });
  },
  extractChanges: async ({ project, artifact }) => {
    const changes = await createChangelogEntry({
      artifact,
      projectDescription: project.description,
    });
    return changes.map((change) => ({
      description: change,
      sourceIdentifier: artifact.id,
    }));
  },
  classifyChange: async (change) => {
    const classifiedChangelog = await classifyChangelog({
      changelog: change.description,
    });
    return changelogClassificationSchema.parse({
      audience: classifiedChangelog.audience.type,
      scope: classifiedChangelog.scope.type,
    });
  },
  filterChange: (change) => {
    return change.classification.audience === "external";
  },
});
