import { type Artifact, getArtifactIdentifier } from "./artifact";
import { artifactWithChanges, type ClassifiedChange } from "./change";
import type { Config, VersionRange } from "./config";

export async function generate(
  config: Config,
  version: VersionRange
): Promise<ClassifiedChange[]> {
  const logger = config.logger;
  await logger?.log("info", "Generating release notes", {
    project: config.project,
    version: version.current,
    previousVersion: version.previous,
  });

  // Fetch all artifacts for the given version
  const fetchedArtifacts = await config.fetchArtifacts(version);
  await logger?.log("debug", "Fetched artifacts", fetchedArtifacts);

  const classifiedArtifacts: Artifact<string, unknown>[] = [];
  for (const artifact of fetchedArtifacts) {
    const artifactIdentifier = getArtifactIdentifier(artifact);
    await logger?.log("debug", `Processing artifact`, { artifactIdentifier });

    // Summarize the artifact
    const summary = await config.summarizeArtifact(artifact);
    const artifactWithSummary: Artifact<string, unknown> = {
      id: artifact.id,
      type: artifact.type,
      data: artifact.data,
      changes: artifact.changes,
      metadata: artifact.metadata,
      summary,
    };

    // Extract changes from the artifact
    const changes = await config.extractChanges(artifactWithSummary);
    await logger?.log(
      "debug",
      `Extracted ${changes.length} changes from ${artifactIdentifier}`,
      changes
    );

    // Classify each change
    const classifiedChanges: ClassifiedChange[] = [];
    for (const change of changes) {
      const classification = await config.classifyChange(change);
      classifiedChanges.push({
        ...change,
        classification,
        sourceIdentifier: artifactIdentifier,
      });
      const updatedArtifact = artifactWithChanges(
        artifactWithSummary,
        classifiedChanges
      );
      classifiedArtifacts.push(updatedArtifact);
    }
    await logger?.log(
      "debug",
      `Classified ${classifiedChanges.length} changes from ${artifactIdentifier}`,
      classifiedChanges
    );
  }

  const classifiedChanges = classifiedArtifacts.flatMap(
    (artifact) => artifact.changes
  );
  await logger?.log(
    "info",
    `Found ${classifiedChanges.length} total changes`,
    classifiedChanges
  );

  const filteredChanges = classifiedChanges.filter((change) =>
    config.filterChange(change)
  );
  await logger?.log(
    "info",
    `Filtered to ${filteredChanges.length} changes`,
    filteredChanges
  );

  return filteredChanges;
}
