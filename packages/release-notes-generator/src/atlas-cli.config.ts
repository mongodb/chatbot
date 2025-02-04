import { createChangelogConfig } from "./config";
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

export default createChangelogConfig({
  projectName: "MongoDB Atlas CLI",
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

// github:
//   owner: "mongodb-ets"
//   repo: "migrator"
//   version: "1.11.0"
//   previousVersion: "1.10.0"
// jira:
//   project: "MIG"
//   version: "1.11.0"
// projectDescription: >-
//   MongoDB Relational Migrator is a tool to help you migrate relational workloads to
//   MongoDB. Relational Migrator allows you to:

//   - design an effective MongoDB schema derived from an existing relational schema
//   - migrate data from Oracle, SQL Server, MySQL, PostgreSQL, or Sybase ASE to MongoDB,
//     while transforming to the target schema
//   - generate code artifacts to reduce the time required to update application code

//   Relational Migrator addresses common migration and data modeling challenges,
//   de-risking an organization's transition to MongoDB while helping them take full
//   advantage of the document model. Relational Migrator is therefore designed for use
//   by personnel put in charge by their organisation to carry out the transition from
//   relational databases to MongoDB.

//   Relational Migrator analyzes an existing relational schema and gives recommendations
//   for mapping to a new MongoDB schema. The visual interface is used to consolidate a
//   large number of tables into a smaller number of collections by using embedded
//   documents and arrays.

//   Snapshots or continuous sync jobs can be created to migrate data from an existing
//   relational database to a target MongoDB cluster based on the new schema mapping.
//   After migrating, data validation can be conducted right from Relational Migrator.

//   Relational Migrator also assists with writing new code or updating existing code to
//   work with MongoDB. Generate Java, JavaScript, and C# code from the new data model,
//   and convert existing SQL queries, triggers, and stored procedures to MongoDB Query
//   API syntax.

//   The application is a React + Spring Boot web application, deployed as a fat Spring
//   Boot JAR file that contains the compiled frontend artifacts and serves them as
//   static resources. The Spring Boot application contains an embedded Tomcat server
//   which also serves the REST API requests coming from the frontend.

//   The following is a partial list of internal dependies used by the project. Any
//   upgrades or changes to these are not user facing and should not be included in
//   external release notes:

//   - @sentry/react
//   - Debezium JDBC connector
