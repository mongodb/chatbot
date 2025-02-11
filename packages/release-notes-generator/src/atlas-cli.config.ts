import "dotenv/config";
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
import {
  assertEnvVars,
  CORE_OPENAI_CONNECTION_ENV_VARS,
} from "mongodb-rag-core";
import {
  makeAzureOpenAiClient,
  makeGenerateChatCompletion,
} from "./openai-api";
import { currentTimestamp } from "./utils";
import { makeSummarizeReleaseArtifact } from "./llm/summarizeReleaseArtifacts";
import { makeCreateChangelogEntry } from "./llm/createChangelogEntry";
import { makeClassifyChangelog } from "./llm/classifyChangelog";
import { changelogClassificationSchema } from "./change";

// Create a logger that writes to both console and file
const logger = createMultiLogger([
  createConsoleLogger(),
  createFileLogger(
    path.join("logs", `atlas-cli-release-notes-${currentTimestamp()}.jsonl`)
  ),
]);

const { OPENAI_API_KEY, OPENAI_ENDPOINT, OPENAI_API_VERSION } = assertEnvVars(
  CORE_OPENAI_CONNECTION_ENV_VARS
);

const openAiClient = makeAzureOpenAiClient({
  apiKey: OPENAI_API_KEY,
  endpoint: OPENAI_ENDPOINT,
  apiVersion: OPENAI_API_VERSION,
});

const { OPENAI_CHAT_COMPLETION_DEPLOYMENT } = assertEnvVars({
  OPENAI_CHAT_COMPLETION_DEPLOYMENT: "",
});

const generateChatCompletion = makeGenerateChatCompletion({
  openAiClient,
  model: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
});

const project = {
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
};

const summarizeReleaseArtifact = makeSummarizeReleaseArtifact({
  generate: generateChatCompletion,
  projectDescription: project.description,
});

const createChangelogEntry = makeCreateChangelogEntry({
  generate: generateChatCompletion,
  projectDescription: project.description,
});

const classifyChangelog = makeClassifyChangelog({
  openAiClient,
  model: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  logger,
});

export default createConfig({
  project,
  logger,
  fetchArtifacts: async (_version) => {
    // const githubArtifacts = await fetchGithubArtifacts(version);
    // const jiraArtifacts = await fetchJiraArtifacts(version);
    // return [...githubArtifacts, ...jiraArtifacts];
    await Promise.resolve();
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
    return summarizeReleaseArtifact({ artifact });
  },
  extractChanges: async (artifact) => {
    const changes = await createChangelogEntry({ artifact });
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
