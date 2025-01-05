import { ReleaseArtifact } from "./projects";
import {
  type MakeGitHubReleaseArtifactsArgs,
  makeGitHubReleaseArtifacts,
} from "./github";
import {
  type MakeJiraReleaseArtifactsArgs,
  makeJiraReleaseArtifacts,
} from "./jira";

export type GetReleaseArtifactsArgs = {
  github?: MakeGitHubReleaseArtifactsArgs;
  jira?: MakeJiraReleaseArtifactsArgs;
};

export async function getReleaseArtifacts({
  github,
  jira,
}: GetReleaseArtifactsArgs): Promise<ReleaseArtifact[]> {
  const artifacts: ReleaseArtifact[] = [];

  if (github) {
    const { version, previousVersion, githubApi, owner, repo } = github;

    const githubReleaseArtifacts = makeGitHubReleaseArtifacts({
      githubApi,
      owner,
      repo,
      version,
      previousVersion,
    });

    const [releaseCommits, jiraIssueKeys] = await Promise.all([
      githubReleaseArtifacts.getCommits(),
      githubReleaseArtifacts.getJiraIssueKeys(),
    ]);

    if (releaseCommits) {
      artifacts.push(...releaseCommits);
    }

    // If we have Jira configuration, fetch the issues using the keys from commits
    if (jira) {
      const { jiraApi, project } = jira;

      const jiraReleaseArtifacts = makeJiraReleaseArtifacts({
        jiraApi,
        project,
        issueKeys: jiraIssueKeys,
      });

      const jiraIssues = await jiraReleaseArtifacts.getIssues();
      artifacts.push(...jiraIssues);
    }
  }

  return artifacts;
}
