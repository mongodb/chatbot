import { ReleaseArtifact } from "./projects";
import {
  MakeGitHubReleaseArtifactsArgs,
  makeGitHubReleaseArtifacts,
} from "./github";

export type GetReleaseArtifactsArgs = {
  github?: MakeGitHubReleaseArtifactsArgs;
};

export async function getReleaseArtifacts({
  github,
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

    console.log(`Found ${releaseCommits.length} commits`);

    artifacts.push(...releaseCommits);
  }

  return artifacts;
}
