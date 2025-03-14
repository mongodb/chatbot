import { fuzzyMatchExecutionResults } from "mongodb-rag-core/executeCode";
import { DatabaseExecutionResultNode } from "./nodeTypes";

// TODO: test this...
export const fuzzyMatchDatabaseExecutionResults: FuzzyMatch<
  DatabaseExecutionResultNode["data"]
> = function (a, b) {
  if (a.result === null && b.result === null) return true;
  if (a.result === null || b.result === null) return false;
  return fuzzyMatchExecutionResults({
    mongoDbOutput: a.result,
    expected: b.result,
    allowedNumberDifference: 0.01,
    isAggregation: a.methods?.includes("aggregation") ?? false,
    orderMatters:
      (a.methods?.includes("sort") || a.queryOperators?.includes("$sort")) ??
      false,
  });
};

export type FuzzyMatch<T> = (a: T, b: T) => boolean | null;

export function fuzzyClusterItems<T>(
  items: T[],
  fuzzyMatch: FuzzyMatch<T>
): number[][] {
  const clusters: number[][] = [];
  const used: boolean[] = new Array(items.length).fill(false);

  for (let i = 0; i < items.length; i++) {
    if (used[i]) continue;
    const cluster: number[] = [i];
    for (let j = i + 1; j < items.length; j++) {
      if (!used[j] && fuzzyMatch(items[i], items[j])) {
        cluster.push(j);
        used[j] = true;
      }
    }
    clusters.push(cluster);
  }
  return clusters;
}
