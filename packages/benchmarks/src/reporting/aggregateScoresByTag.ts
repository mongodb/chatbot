import { strict as assert } from "assert";
import { EvalCase } from "mongodb-rag-core/braintrust";
import { ExperimentResult } from "./getBraintrustExperimentResults";
import { ScoreStats, calculateStats } from "./calculateStats";

/**
  @example
  ```typescript
  const tagStates: TagStates = new Map();
  tagStates.set("some_tag", {
    accuracy: {
      mean: 0.9,
      median: 0.9,
      mode: 0.9,
      min: 0.8,
      max: 1.0,
      count: 3,
    },
    relevance: {
      mean: 0.8,
      median: 0.8,
      mode: null,
      min: 0.7,
      max: 0.9,
      count: 3,
    },
  });
  ```
 */
export type TagStats = Map<string, Record<string, ScoreStats>>;

export function aggregateScoresByTag<
  EC extends EvalCase<unknown, unknown, unknown>,
  ScoreTypes extends string[]
>(
  experimentResults: ExperimentResult<EC, unknown, ScoreTypes>[],
  aggregateScoreNames: string[]
): TagStats {
  // First, collect all score values by tag and score name
  const scoresByTag = new Map<string, Record<string, number[]>>();

  for (const experimentResult of experimentResults) {
    // Skip if scores is undefined
    if (!experimentResult.scores) continue;

    // Get tags from the eval case
    const tags = experimentResult.tags || [];
    if (tags.length === 0) continue;

    for (const tag of tags) {
      // Initialize the tag entry if it doesn't exist
      if (!scoresByTag.has(tag)) {
        scoresByTag.set(tag, {});
      }

      // Get the score record for this tag
      const tagScores = scoresByTag.get(tag);
      assert(tagScores, `Tag ${tag} not found`);

      // Add each score to the appropriate array
      for (const scoreName of aggregateScoreNames) {
        const score = experimentResult.scores[scoreName as ScoreTypes[number]];
        if (score === undefined || score === null) {
          continue;
        }

        // Initialize the score array if it doesn't exist
        if (!tagScores[scoreName]) {
          tagScores[scoreName] = [];
        }

        // Add the score to the array
        tagScores[scoreName].push(score);
      }
    }
  }

  // Now calculate statistics for each tag and score
  const tagStats = new Map<string, Record<string, ScoreStats>>();

  for (const [tag, scores] of scoresByTag.entries()) {
    const tagStat: Record<string, ScoreStats> = {};

    for (const [scoreName, scoreValues] of Object.entries(scores)) {
      if (scoreValues.length === 0) {
        continue;
      }
      // Calculate statistics for this score
      tagStat[scoreName] = calculateStats(scoreValues);
    }

    tagStats.set(tag, tagStat);
  }

  return tagStats;
}
