import { EvalCase } from "mongodb-rag-core/braintrust";
import { ExperimentResult } from "./getBraintrustExperimentResults";
import { ScoreStats, calculateStats } from "./calculateStats";

/**
  Calculates the mean score for a specific score metric across all experiment results
 */
export function aggregateExperimentScoreMean<
  EC extends EvalCase<unknown, unknown, unknown>,
  ScoreTypes extends string[]
>(
  experimentResults: ExperimentResult<EC, unknown, ScoreTypes>[],
  scoreName: ScoreTypes[number] // Type the scoreName as an element of ScoreTypes array
): ScoreStats | null {
  // Filter out results with undefined or null scores for the given score name
  const validScores = experimentResults
    .map((result) => result.scores?.[scoreName])
    .filter((score): score is number => score !== undefined && score !== null);

  // Calculate and return statistics for the valid scores
  return validScores.length > 0 ? calculateStats(validScores) : null;
}
