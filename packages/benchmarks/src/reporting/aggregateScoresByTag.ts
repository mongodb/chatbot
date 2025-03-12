import { strict as assert } from "assert";
import { EvalCase } from "mongodb-rag-core/braintrust";
import { ExperimentResult } from "./getBraintrustExperimentResults";

/**
  Statistics for a set of scores
 */
export interface ScoreStats {
  mean: number;
  median: number;
  mode: number | null;
  min: number;
  max: number;
  count: number;
}

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

/**
  Calculate statistics for an array of numeric values
 */
export function calculateStats(values: number[]): ScoreStats {
  if (values.length === 0) {
    throw new Error("Cannot calculate statistics for an empty array");
  }

  const sortedValues = [...values].sort((a, b) => a - b);

  // Calculate mean
  const sum = sortedValues.reduce((acc, val) => acc + val, 0);
  const mean = sum / sortedValues.length;

  // Calculate median
  const mid = Math.floor(sortedValues.length / 2);
  const median =
    sortedValues.length % 2 === 0
      ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
      : sortedValues[mid];

  // Calculate mode (most frequent value)
  const frequency: Record<number, number> = {};
  let maxFreq = 0;
  let mode: number | null = null;

  for (const value of sortedValues) {
    frequency[value] = (frequency[value] || 0) + 1;
    if (frequency[value] > maxFreq) {
      maxFreq = frequency[value];
      mode = value;
    }
  }

  // If all values appear the same number of times, there is no mode
  if (
    Object.values(frequency).every((freq) => freq === maxFreq) &&
    Object.keys(frequency).length > 1
  ) {
    mode = null;
  }

  // Calculate min and max
  const min = sortedValues[0];
  const max = sortedValues[sortedValues.length - 1];

  return {
    mean,
    median,
    mode,
    min,
    max,
    count: sortedValues.length,
  };
}

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

    // Use the first tag as the primary tag
    const tag = tags[0];

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
