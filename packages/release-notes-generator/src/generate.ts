import type { SomeArtifact } from "./artifact";
import { getArtifactIdentifier } from "./artifact";
import { artifactWithChanges, type ClassifiedChange } from "./change";
import type { Config, VersionRange } from "./config";
import { PromisePool } from "@supercharge/promise-pool";

export async function generate(
  config: Config,
  version: VersionRange,
): Promise<ClassifiedChange[]> {
  const logger = config.logger;
  await logger?.log("info", "Generating release notes", {
    project: config.project,
    version: version.current,
    previousVersion: version.previous,
  });

  // Fetch all artifacts for the given version
  const fetchedArtifacts = await config.fetchArtifacts(version);
  await logger?.log("debug", `Fetched ${fetchedArtifacts.length} artifacts`, {
    ids: fetchedArtifacts.map((artifact) => getArtifactIdentifier(artifact)),
  });

  const { results: classifiedArtifacts } = await PromisePool.withConcurrency(
    config.llmMaxConcurrency,
  )
    .for(fetchedArtifacts)
    .handleError((error, artifact) => {
      void logger?.log("error", "Error processing artifact", {
        type: artifact.type,
        id: artifact.id,
        error: {
          name: error.name,
          message: error.message,
        },
      });
    })
    .process(async (artifact) => {
      const artifactIdentifier = getArtifactIdentifier(artifact);
      void logger?.log("debug", `Processing artifact`, { artifactIdentifier });

      // Summarize the artifact
      void logger?.log("debug", "Summarizing artifact", {
        artifactIdentifier,
      });
      const summary = await config.summarizeArtifact({
        project: config.project,
        artifact,
      });
      const artifactWithSummary = {
        id: artifact.id,
        type: artifact.type,
        data: artifact.data,
        changes: artifact.changes,
        summary,
      } satisfies SomeArtifact;

      void logger?.log("debug", "Summarized artifact", {
        artifactIdentifier,
        summary,
      });

      // Extract changes from the artifact
      void logger?.log("debug", "Extracting changes from artifact", {
        artifactIdentifier,
      });
      const changes = await config.extractChanges({
        project: config.project,
        artifact: artifactWithSummary,
      });
      void logger?.log(
        "debug",
        `Extracted ${changes.length} changes from ${artifactIdentifier}`,
        changes,
      );

      // Classify each change
      void logger?.log("debug", "Classifying changes", {
        artifactIdentifier,
      });
      const classifiedChanges: ClassifiedChange[] = [];
      for (const change of changes) {
        const classification = await config.classifyChange(change);
        classifiedChanges.push({
          ...change,
          classification,
          sourceIdentifier: artifactIdentifier,
        });
      }
      const updatedArtifact = artifactWithChanges(
        artifactWithSummary,
        classifiedChanges,
      );
      void logger?.log(
        "debug",
        `Classified ${classifiedChanges.length} changes from ${artifactIdentifier}`,
        { classifiedChanges },
      );
      return updatedArtifact;
    });

  const allClassifiedChanges = classifiedArtifacts.flatMap(
    (artifact) => artifact.changes,
  );
  void logger?.log(
    "info",
    `Found ${allClassifiedChanges.length} total changes`,
    allClassifiedChanges,
  );

  const filteredChanges = allClassifiedChanges.filter((change) =>
    config.filterChange(change),
  );
  void logger?.log("info", `Filtered to ${filteredChanges.length} changes`, {
    filteredChanges,
  });

  return filteredChanges;
}
