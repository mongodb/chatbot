import JiraApi from "jira-client";
import { JiraIssueArtifact } from "./projects";
import { z } from "zod";

export type JiraReleaseArtifacts = {
  /**
   Fetches the issues relevant to a given release.
   */
  getIssues(): Promise<JiraIssueArtifact[]>;
};

export const JiraReleaseInfo = z.object({
  version: z.string().optional().describe("The version of the release. This (naïvely) corresponds to a Jira fixVersion."),
  issueKeys: z.array(z.string()).optional().describe("Array of Jira issue keys (e.g., MIG-xxxx). If not provided, will be extracted from commit messages."),
  project: z.string().optional().describe("The Jira project key."),
});

export type JiraReleaseInfo = z.infer<typeof JiraReleaseInfo>;

export type MakeJiraReleaseArtifactsArgs = JiraReleaseInfo & {
  /**
   A Jira API client
   */
  jiraApi: JiraApi;
};

export function makeJiraReleaseArtifacts({
  jiraApi,
  project,
  version,
  issueKeys = [], // Provide empty array as default value
}: MakeJiraReleaseArtifactsArgs): JiraReleaseArtifacts {
  return {
    getIssues: async () => {
      const queryParts: string[] = [];

      if (issueKeys.length > 0) {
        // Fetch the issues by their keys
        queryParts.push(`issue IN (${issueKeys.join(',')})`);
      } else {
        // Fetch the issues relevant to the given version
        queryParts.push(`fixVersion = ${version}`);
      }

      if (project) {
        queryParts.push(`project = ${project}`);
      }
      const jqlQuery = queryParts.join(" AND ");
      console.log(`Fetching Jira issues with query: ${jqlQuery}`);
        
      let fetchedIssues: JiraIssue[] = [];
      let currentPageIndex = 0;
      let totalMatchingIssues = 0;
      
      do {
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
          startAt: currentPageIndex,
          maxResults: 100, // Increase from default 50 to 100 to reduce number of API calls
        })) as JiraSearchResponse;

        fetchedIssues = fetchedIssues.concat(response.issues);
        totalMatchingIssues = response.total;
        currentPageIndex += response.maxResults;
        
        console.log(`Fetched ${response.issues.length} issues (${fetchedIssues.length}/${totalMatchingIssues} total)`);
      } while (fetchedIssues.length < totalMatchingIssues);

      console.log(`Found ${fetchedIssues.length} issues`);
      if (issueKeys.length > 0) {
        console.log(`out of ${issueKeys.length} requested`)
      }
      
      if (fetchedIssues.length < issueKeys.length) {
        const foundKeys = fetchedIssues.map(issue => issue.key);
        const missingKeys = issueKeys.filter(key => !foundKeys.includes(key));
        console.log(`Missing Jira issues: ${missingKeys.join(', ')}`);
      }

      return fetchedIssues.map((issue) => {
        console.log(`Processing issue ${issue.key}:`);
        console.log(`- Resolution: ${issue.fields.resolution ? issue.fields.resolution.name : 'null'}`);
        
        return {
          type: "jira-issue",
          data: {
            key: issue.key,
            summary: issue.fields.summary,
            description: issue.fields.description,
            components: issue.fields.components?.map(
              (component) => component.name
            ) ?? [],
            fixVersions: issue.fields.fixVersions.map(
              (fixVersion) => fixVersion.name
            ),
            resolution: issue.fields.resolution?.name ?? 'Unresolved',
            priority: issue.fields.priority?.name ?? 'None',
            status: issue.fields.status?.name ?? 'Unknown',
            issuetype: issue.fields.issuetype?.name ?? 'Unknown',
          },
        };
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
    // assignee: {
    //   name: string;
    // };
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
