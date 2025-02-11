import JiraApi from "jira-client";
import type { JiraIssueArtifact } from "../llm/projects";
import { z } from "zod";
import type { Logger } from "../logger";
import { makeJiraIssueArtifact } from "./artifacts";

export type MakeJiraApiClientArgs = {
  username: string;
  password: string;
};

export const makeJiraApiClient = ({
  username,
  password,
}: MakeJiraApiClientArgs) => {
  return new JiraApi({
    protocol: "https",
    host: "jira.mongodb.org",
    apiVersion: "2",
    strictSSL: true,
    username,
    password,
  });
};

export type JiraReleaseArtifacts = {
  /**
   Fetches the issues relevant to a given release.
   */
  getIssues(): Promise<JiraIssueArtifact[]>;
};

export const JiraReleaseInfoSchema = z.object({
  version: z
    .string()
    .optional()
    .describe(
      "The version of the release. This (naïvely) corresponds to a Jira fixVersion."
    ),
  issueKeys: z
    .array(z.string())
    .optional()
    .describe(
      "Array of Jira issue keys (e.g., MIG-xxxx). If not provided, will be extracted from commit messages."
    ),
  project: z.string().optional().describe("The Jira project key."),
});

export const JiraQuerySchema = z.object({
  query: z.string().describe("A Jira query string (JQL)."),
});

export type JiraQuery = z.infer<typeof JiraQuerySchema>;

export type JiraReleaseInfo = z.infer<typeof JiraReleaseInfoSchema>;

export type MakeJiraReleaseArtifactsArgs = (JiraReleaseInfo | JiraQuery) & {
  /**
   A Jira API client
   */
  jiraApi: JiraApi;

  /**
   A logger
   */
  logger?: Logger;
};

export function makeJiraReleaseArtifacts({
  jiraApi,
  logger,
  ...args
}: MakeJiraReleaseArtifactsArgs): JiraReleaseArtifacts {
  // If args is a JiraReleaseInfo, extract the version and issueKeys
  // Otherwise, extract the query

  return {
    getIssues: async () => {
      const queryParts: string[] = [];

      let jqlQuery: string;

      if ("query" in args) {
        jqlQuery = args.query;
      } else {
        const { version, issueKeys, project } =
          JiraReleaseInfoSchema.parse(args);

        if (project) {
          queryParts.push(`project = ${project}`);
        }

        if (version) {
          // Fetch the issues relevant to the given version
          queryParts.push(`fixVersion = ${version}`);
        }

        if (issueKeys && issueKeys.length > 0) {
          // Fetch the issues by their keys
          queryParts.push(`issue IN (${issueKeys.join(",")})`);
        }

        jqlQuery = queryParts.join(" AND ");
      }

      if (jqlQuery.length === 0) {
        throw new Error("No JQL query provided");
      }

      logger?.log("info", "Fetching Jira issues", { jqlQuery });

      const fetchedIssues: JiraIssue[] = [];

      // These variables + the while loop are used to handle pagination
      const maxResults = 100; // Maximum results per page
      let startAt = 0; // The starting index of the issues to fetch
      let moreToFetch = true;

      while (moreToFetch) {
        const response = (await jiraApi.searchJira(jqlQuery, {
          expand: ["customfield_15650"],
          fields: [
            "fixVersions",
            "components",
            "resolution",
            "priority",
            "summary",
            "description",
            "status",
            "issuetype",
            "project",
          ],
          startAt,
          maxResults,
        })) as JiraSearchResponse;

        fetchedIssues.push(...response.issues);

        logger?.log("info", "Fetched page of Jira issues", {
          page: Math.floor(startAt / maxResults) + 1,
          fetchedCount: fetchedIssues.length,
          totalCount: response.total,
        });

        if (fetchedIssues.length >= response.total) {
          moreToFetch = false;
          break;
        }

        startAt += maxResults;
      }

      logger?.log("info", "Completed fetching Jira issues", {
        issueKeys: fetchedIssues.map((issue) => issue.key),
      });
      return fetchedIssues.map((issue) => {
        return makeJiraIssueArtifact({
          id: issue.key,
          data: {
            key: issue.key,
            summary: issue.fields.summary,
            description: issue.fields.description,
            components:
              issue.fields.components?.map((component) => component.name) ?? [],
            fixVersions: issue.fields.fixVersions.map(
              (fixVersion) => fixVersion.name
            ),
            resolution: issue.fields.resolution?.name ?? "Unresolved",
            priority: issue.fields.priority?.name ?? "None",
            status: issue.fields.status?.name ?? "Unknown",
            issuetype: issue.fields.issuetype?.name ?? "Unknown",
          },
        });
      });
    },
  };
}

type JiraSearchResponse = {
  expand: string;
  startAt: number;
  maxResults: number;
  total: number;
  issues: JiraIssue[];
};

type JiraIssue = {
  expand: string;
  id: string;
  self: string;
  key: string;
  fields: {
    fixVersions: {
      self: string;
      id: string;
      name: string;
      archived: boolean;
      released: boolean;
      releaseDate?: string;
    }[];
    components: {
      self: string;
      id: string;
      name: string;
    }[];
    resolution: {
      self: string;
      id: string;
      description: string;
      name: string;
    };
    priority: {
      self: string;
      iconUrl: string;
      name: string;
      id: string;
    };
    summary: string;
    description: string;
    status: {
      self: string;
      description: string;
      name: string;
      id: string;
      iconUrl: string;
    };
    issuetype: {
      self: string;
      id: string;
      description: string;
      iconUrl: string;
      name: string;
      subtask: boolean;
      avatarId: number;
    };
    project: {
      self: string;
      id: string;
      key: string;
      name: string;
      projectTypeKey: string;
    };
  };
};
