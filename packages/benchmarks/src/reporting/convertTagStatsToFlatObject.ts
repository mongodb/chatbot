import { TagStats } from "./aggregateScoresByTag";

/**
  Converts the tagStats Map to a flat object with headers formatted as <Score>.mean, <Score>.length, etc.
  This makes it easier to export the data to formats like CSV.flat object where keys are formatted as "<tag>.<score>.<stat>"
 */
export function convertTagStatsToFlatObject(
  tagStats: TagStats
): Record<string, Record<string, number | null>> {
  const result: Record<string, Record<string, number | null>> = {};

  // Process each tag
  for (const [tag, scoreStats] of tagStats.entries()) {
    result[tag] = {};

    // Process each score type (accuracy, relevance, etc.)
    for (const [scoreName, stats] of Object.entries(scoreStats)) {
      for (const [statName, value] of Object.entries(stats)) {
        result[tag][`${scoreName}.${statName}`] = value;
      }
    }
  }

  return result;
}
