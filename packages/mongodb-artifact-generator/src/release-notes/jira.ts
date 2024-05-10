import JiraApi from "jira-client";
import { JiraIssueArtifact } from "./projects";
import { splitDiff } from "./splitDiff";

export type JiraReleaseArtifacts = {
  /**
   Fetches the issues relevant to a given release.
   */
  getIssues(): Promise<JiraIssueArtifact[]>;
};

export type MakeJiraReleaseArtifactsArgs = {
  /**
   A Jira API client
   */
  jiraApi: JiraApi;

  /**
   The Jira project key
   */
  project?: string;

  /**
   The version of the release. This (naïvely) corresponds to a Jira fixVersion.
   */
  version: string;
};

export function makeJiraReleaseArtifacts({
  jiraApi,
  project,
  version,
}: MakeJiraReleaseArtifactsArgs): JiraReleaseArtifacts {
  return {
    getIssues: async () => {
      // Fetch the issues relevant to the given version
      const queryParts = [`fixVersion = ${version}`];
      if (project) {
        queryParts.push(`project = ${project}`);
      }
      const jqlQuery = queryParts.join(" AND ");
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
      })) as JiraSearchResponse;

      console.log(`Found ${response.total} issues`);

      return response.issues.map((issue) => ({
        type: "jira-issue",
        data: {
          key: issue.key,
          summary: issue.fields.summary,
          description: issue.fields.description,
          components: issue.fields.components.map(
            (component) => component.name
          ),
          fixVersions: issue.fields.fixVersions.map(
            (fixVersion) => fixVersion.name
          ),
          resolution: issue.fields.resolution.name,
          priority: issue.fields.priority.name,
          status: issue.fields.status.name,
          issuetype: issue.fields.issuetype.name,
        },
      }));
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

function convertJiraIssueToArtifact(issue: JiraIssue) {
  return {
    type: "jira-issue",
    data: {
      key: issue.key,
      summary: issue.fields.summary,
      description: issue.fields.description,
    },
  };
}
