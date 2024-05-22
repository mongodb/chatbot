import { Config } from "./Config";
import { ArtifactGeneratorEnvVars } from "./ArtifactGeneratorEnvVars";
import { ReleaseNotesEnvVars } from "./ReleaseNotesEnvVars";
import {
  assertEnvVars,
  makeOpenAiEmbedder,
  makeMongoDbEmbeddedContentStore,
  makeMongoDbPageStore,
  OpenAIClient,
  AzureKeyCredential,
} from "mongodb-rag-core";
import { Octokit } from "@octokit/rest";
import JiraApi from "jira-client";

const {
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_EMBEDDING_DEPLOYMENT,
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE_NAME,
} = assertEnvVars(ArtifactGeneratorEnvVars);

// Optional env vars (only required for some commands)
const { GITHUB_ACCESS_TOKEN, JIRA_USERNAME, JIRA_PASSWORD } = process.env;

export const standardConfig = {
  embedder: () =>
    makeOpenAiEmbedder({
      openAiClient: new OpenAIClient(
        OPENAI_ENDPOINT,
        new AzureKeyCredential(OPENAI_API_KEY)
      ),
      deployment: OPENAI_EMBEDDING_DEPLOYMENT,
      backoffOptions: {
        numOfAttempts: 25,
        startingDelay: 1000,
      },
    }),
  embeddedContentStore: () =>
    makeMongoDbEmbeddedContentStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_DATABASE_NAME,
    }),
  pageStore: () =>
    makeMongoDbPageStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_DATABASE_NAME,
    }),
  openAiClient: () => {
    return new OpenAIClient(
      OPENAI_ENDPOINT,
      new AzureKeyCredential(OPENAI_API_KEY)
    );
  },
  jiraApi:
    JIRA_USERNAME && JIRA_PASSWORD
      ? () => {
          return new JiraApi({
            protocol: "https",
            host: "jira.mongodb.org",
            apiVersion: "2",
            strictSSL: true,
            username: JIRA_USERNAME,
            password: JIRA_PASSWORD,
          });
        }
      : undefined,
  githubApi: GITHUB_ACCESS_TOKEN
    ? () => {
        return new Octokit({
          auth: GITHUB_ACCESS_TOKEN,
        });
      }
    : undefined,
} satisfies Config;

export default standardConfig;
