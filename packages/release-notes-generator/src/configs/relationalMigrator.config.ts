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

const standardConfigMethods = makeStandardConfigMethods({
  azureOpenAi: {
    apiKey: OPENAI_API_KEY,
    endpoint: OPENAI_ENDPOINT,
    apiVersion: OPENAI_API_VERSION,
    chatCompletionDeployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  },
  logger: {
    namespace: "relational-migrator",
    outputDir: "./logs/relational-migrator",
  },
});

export default createConfig({
  llmMaxConcurrency: 4,
  project: {
    name: "MongoDB Relational Migrator",
    description: stripIndents`
      The MongoDB Relational Migrator tool help users migrate existing relational
      workloads to MongoDB. It includes a GUI client that lets you:

      - Design an effective MongoDB schema derived from an existing relational schema
      - Migrate data from Oracle, SQL Server, MySQL, PostgreSQL, or Sybase ASE to MongoDB,
        while transforming to the target schema
      - Generate code artifacts to reduce the time required to update application code

      Relational Migrator addresses common migration and data modeling challenges,
      de-risking an organization's transition to MongoDB while helping them take full
      advantage of the document model.

      The tool analyzes an existing relational schema and gives recommendations for
      mapping to a new MongoDB schema. The visual interface is used to consolidate a
      large number of tables into a smaller number of collections by using embedded
      documents and arrays.

      Users can create snapshots or continuous sync jobs to migrate data from an
      existing relational database to a target MongoDB cluster based on the new
      schema mapping. After migrating, users can conduct data validation from within
      the Relational Migrator UI.

      Relational Migrator also assists with writing new code or updating existing
      code to work with MongoDB. Users can generate code (e.g. Java, JavaScript, and
      C#) the uses the new data model, and convert existing SQL queries, triggers,
      and stored procedures to MongoDB Query API syntax.

      The application is a React + Spring Boot web application, deployed as a fat Spring
      Boot JAR file that contains the compiled frontend artifacts and serves them as
      static resources. The Spring Boot application contains an embedded Tomcat server
      which also serves the REST API requests coming from the frontend.`,
  },
  ...standardConfigMethods,
  fetchArtifacts: async (version): Promise<SomeArtifact[]> => {
    if (!version.previous) {
      throw new Error("Previous version is required");
    }
    const github = makeGitHubReleaseArtifacts({
      githubApi: makeGitHubApiClient({
        authToken: GITHUB_ACCESS_TOKEN,
      }),
      owner: "mongodb-ets",
      repo: "migrator",
      version: version.current,
      previousVersion: version.previous,
    });
    const commits = await github.getCommits();

    const jiraProject = "MIG";
    const referencedJiraIssueKeys = await github.getJiraIssueKeys(jiraProject);
    const jira = makeJiraReleaseArtifacts({
      jiraApi: makeJiraApiClient({
        username: JIRA_USERNAME,
        password: JIRA_PASSWORD,
      }),
      project: jiraProject,
      issueKeys: referencedJiraIssueKeys,
    });
    const issues = await jira.getIssues();

    return Array<SomeArtifact>().concat(commits, issues);
  },
  classifyChange: async (change) => {
    // TODO: RelMig uses conventional commits, so we can probably skip the LLM calls.
    // For now, we'll use the standard config method which calls the LLM.
    return standardConfigMethods.classifyChange(change);
  },
});
