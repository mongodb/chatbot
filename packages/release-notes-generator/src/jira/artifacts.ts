import { makeArtifact, createArtifactSchema } from "../artifact";
import { z } from "zod";

export const jiraIssueSchema = z.object({
  key: z.string(),
  summary: z.string(),
  description: z.string(),
  components: z.array(z.string()),
  fixVersions: z.array(z.string()),
  resolution: z.string(),
  priority: z.string(),
  status: z.string(),
  issuetype: z.string(),
});

export type JiraIssue = z.infer<typeof jiraIssueSchema>;

export const jiraIssueArtifactSchema = createArtifactSchema(
  z.literal("jira-issue"),
  jiraIssueSchema
);

export type JiraIssueArtifact = z.infer<typeof jiraIssueArtifactSchema>;

export function makeJiraIssueArtifact(args: {
  id: string;
  data: JiraIssue;
  summary?: string;
}): JiraIssueArtifact {
  return makeArtifact(
    {
      id: args.id,
      type: "jira-issue",
      data: args.data,
      summary: args.summary,
    },
    jiraIssueArtifactSchema
  );
}

export function getJiraIssueIdentifier(artifact: JiraIssueArtifact): string {
  return `${artifact.type}::${artifact.data.key}`;
}

export function getCondensedJiraIssue(artifact: JiraIssueArtifact) {
  return {
    id: artifact.id,
    type: artifact.type,
    summary: artifact.summary ?? "No summary provided",
    key: artifact.data.key,
    status: artifact.data.status,
    issuetype: artifact.data.issuetype,
  };
}
