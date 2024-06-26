import {
  GitCommitArtifact,
  JiraIssueArtifact,
  JiraLinkedGitCommit,
  ReleaseArtifact,
} from "./projects";
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

    const [releaseCommits] = await Promise.all([
      githubReleaseArtifacts.getCommits(),
    ]);

    artifacts.push(...releaseCommits);
  }

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

    artifacts.push(...releaseIssues);
  }

  if (jira && github) {
    // For each jira issue, get its linkedGitCommits and see if we have
    // artifacts for those. If we have artifacts for those, replace the existing
    // the jira-issue linkedGitCommit with the full git-commit artifact + remove
    // the standalone git-commit from the set of artifacts.
    const jiraIssues = artifacts.filter(
      (artifact): artifact is JiraIssueArtifact =>
        artifact.type === "jira-issue"
    );
    const gitCommits = artifacts.filter(
      (artifact): artifact is GitCommitArtifact =>
        artifact.type === "git-commit"
    );
    const linkedGitCommits = jiraIssues
      .map((issue) => issue.data.linkedGitCommits)
      .filter(
        (linkedGitCommits): linkedGitCommits is JiraLinkedGitCommit[] =>
          linkedGitCommits !== undefined
      )
      .flat();
    const unlinkedGitCommits = gitCommits.filter(
      (gitCommit) =>
        !linkedGitCommits.some(
          (linkedGitCommit) => linkedGitCommit.hash === gitCommit.data.hash
        )
    );

    const jiraIssuesWithLinkedCommitArtifacts = jiraIssues.map((issue) => {
      return {
        ...issue,
        linkedGitCommits: issue.data.linkedGitCommits?.map(
          (linkedGitCommit) => {
            const fullGitCommit = gitCommits.find(
              (gitCommit) => gitCommit.data.hash === linkedGitCommit.hash
            );
            if (fullGitCommit) {
              return {
                ...linkedGitCommit,
                hash: fullGitCommit.data.hash,
                message: fullGitCommit.data.message,
                files: fullGitCommit.data.files,
              };
            }
            return linkedGitCommit;
          }
        ),
      };
    });

    return [...jiraIssuesWithLinkedCommitArtifacts, ...unlinkedGitCommits];
  }

  return artifacts;
}
