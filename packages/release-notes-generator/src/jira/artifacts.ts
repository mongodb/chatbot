import { artifactSchema } from "../artifact";
import { z } from "zod";

export const jiraIssueSchema = z.object({
  key: z.string(),
  summary: z.string(),
  description: z.string().or(z.null()),
  components: z.array(z.string()),
  fixVersions: z.array(z.string()),
  resolution: z.string(),
  priority: z.string(),
  status: z.string(),
  issuetype: z.string(),
  releaseNotes: z.string().or(z.null()),
  docsChangesDescription: z.string().or(z.null()),
});

export type JiraIssue = z.infer<typeof jiraIssueSchema>;

export const jiraIssueArtifactSchema = artifactSchema(
  "jira-issue",
  jiraIssueSchema,
);

export type JiraIssueArtifact = z.infer<typeof jiraIssueArtifactSchema>;

export function makeJiraIssueArtifact(args: {
  id: string;
  data: JiraIssue;
}): JiraIssueArtifact {
  return jiraIssueArtifactSchema.parse({
    id: args.id,
    type: "jira-issue",
    data: args.data,
  });
}

export function getJiraIssueIdentifier(artifact: JiraIssueArtifact): string {
  return `${artifact.type}::${artifact.data.key}`;
}

export type CondensedJiraIssue = {
  id: string;
  type: string;
  summary: string;
  key: string;
  status: string;
  issuetype: string;
};

export function getCondensedJiraIssue(
  artifact: JiraIssueArtifact,
): CondensedJiraIssue {
  return {
    id: artifact.id,
    type: artifact.type,
    summary: artifact.summary ?? "No summary provided",
    key: artifact.data.key,
    status: artifact.data.status,
    issuetype: artifact.data.issuetype,
  };
}
