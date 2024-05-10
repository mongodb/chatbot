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

  // if (github) {
  //   const { version, previousVersion, githubApi, owner, repo } = github;

  //   const githubReleaseArtifacts = makeGitHubReleaseArtifacts({
  //     githubApi,
  //     owner,
  //     repo,
  //     version,
  //     previousVersion,
  //   });

  //   const [releaseCommits] = await Promise.all([
  //     githubReleaseArtifacts.getCommits(),
  //   ]);

  //   console.log(`Found ${releaseCommits.length} commits`);

  //   artifacts.push(...releaseCommits);
  // }

  if (jira) {
    const { version, jiraApi, project } = jira;

    const jiraReleaseArtifacts = makeJiraReleaseArtifacts({
      jiraApi,
      project,
      version,
    });

    const [releaseIssues] = await Promise.all([
      jiraReleaseArtifacts.getIssues(),
    ]);

    console.log(`Found ${releaseIssues.length} issues`);

    artifacts.push(...releaseIssues);
  }

  return artifacts;
}
