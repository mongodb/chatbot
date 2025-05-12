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
