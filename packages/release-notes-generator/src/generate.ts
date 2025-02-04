import { type Artifact } from "./Artifact";
import {
  artifactWithChanges,
  ClassifiedChange,
  type SomeClassification,
} from "./Change";
import { type Config, type VersionRange } from "./Config";

export async function generate<Classification extends SomeClassification>(
  config: Config<Classification>,
  version: VersionRange
) {
  console.log("Generating release notes for", config.projectName);

  // Fetch all artifacts for the given version
  const fetchedArtifacts = await config.fetchArtifacts(version);
  const classifiedArtifacts: Artifact<string, unknown, Classification>[] = [];
  for (const artifact of fetchedArtifacts) {
    const artifactIdentifier = artifact.identifier() as string;
    // Summarize the artifact
    const summary = await config.summarizeArtifact(artifact);
    artifact.summary = summary;

    // Extract changes from the artifact
    const changes = await config.extractChanges(artifact);

    // Classify each change
    const classifiedChanges: ClassifiedChange<Classification>[] = [];
    for (const change of changes) {
      const classification = await config.classifyChange(change);
      classifiedChanges.push({
        ...change,
        classification,
        sourceIdentifier: artifactIdentifier,
      });
      const updatedArtifact = artifactWithChanges<
        Classification,
        Artifact<string, unknown, Classification>
      >(
        artifact as Artifact<string, unknown, Classification>,
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
