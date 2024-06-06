import JiraApi from "jira-client";
import { JiraIssueArtifact, JiraLinkedGitCommit } from "./projects";
import { z } from "zod";
import { PromisePool } from "@supercharge/promise-pool";
import { iOfN } from "../utils";

export type JiraReleaseArtifacts = {
  /**
   Fetches the issues relevant to a given release.
   */
  getIssues(): Promise<JiraIssueArtifact[]>;
};

export const JiraReleaseInfo = z.object({
  version: z
    .string()
    .describe(
      "The version of the release. This (naïvely) corresponds to a Jira fixVersion."
    ),
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

      const errors: Error[] = [];
      const { results } = await PromisePool.withConcurrency(4)
        .for(response.issues)
        .handleError((error, issue) => {
          const errMessage = `Error getting GitHub commits for ${issue.key}. ${error.name} "" ${error.message}`;
          console.log(errMessage);
          // logger?.logError(errMessage);
          errors.push(error);
        })
        .process<[string, JiraLinkedGitCommit[]]>(async (issue, index) => {
          console.log(
            `fetching git commits for issue ${issue.key} ${iOfN(
              index,
              response.issues.length
            )}`
          );
          return [
            issue.key,
            await getLinkedGitCommits({ jiraApi, issueId: issue.id }),
          ];
        });
      if (errors.length > 0) {
        // logger?.logInfo(`${errors.length} errors occurred while fetching git commits.`);
        console.log(
          `${errors.length} errors occurred while fetching git commits.`
        );
      }
      const linkedCommitsByIssue = Object.fromEntries(results);

      return response.issues.map((issue) => {
        const linkedGitCommits = linkedCommitsByIssue[issue.key] ?? undefined;
        return {
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
            linkedGitCommits,
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

export async function getLinkedGitCommits({
  jiraApi,
  issueId,
}: {
  jiraApi: JiraApi;
  issueId: string;
}): Promise<JiraLinkedGitCommit[]> {
  const { detail } = await jiraApi.getDevStatusDetail(
    "2537318",
    "github",
    "repository"
  );
  type Repository = {
    id: string;
    url: string;
    commits: {
      id: string;
      message: string;
    }[];
  };
  const repos = detail[0].repositories as Repository[];
  const commits = repos.flatMap((repo) => {
    return repo.commits.map((commit) => {
      return {
        repo: {
          url: repo.url,
        },
        hash: commit.id,
        message: commit.message,
      };
    });
  });
  console.log(`commits for ${issueId}:`, commits);
  return commits as JiraLinkedGitCommit[];
  // issueDetails.map((issue) => {
  //   return {
  //     repo: {
  //       owner: linkedCommit.repository.owner,
  //       name: linkedCommit.repository.name,
  //       url: linkedCommit.repository.url,
  //     },
  //     hash: linkedCommit.hash,
  //     message: linkedCommit.message,
  //   };
  // });
}
