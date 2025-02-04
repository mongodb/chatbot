import { type Artifact, getArtifactIdentifier } from "./Artifact";
import { artifactWithChanges, type ClassifiedChange } from "./Change";
import { type Config, type VersionRange } from "./config";

export async function generate(config: Config, version: VersionRange) {
  console.log(
    `Generating release notes for ${config.projectName} @ ${version.current}`
  );

  // Fetch all artifacts for the given version
  const fetchedArtifacts = await config.fetchArtifacts(version);
  const classifiedArtifacts: Artifact<string, unknown>[] = [];
  for (const artifact of fetchedArtifacts) {
    const artifactIdentifier = getArtifactIdentifier(artifact);
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
  }

  const classifiedChanges = classifiedArtifacts.flatMap(
    (artifact) => artifact.changes
  );
  console.log("Classified changes:", classifiedChanges);

  const filteredChanges = classifiedChanges.filter((change) =>
    config.filterChange(change)
  );
  console.log("Filtered changes:", filteredChanges);
}
