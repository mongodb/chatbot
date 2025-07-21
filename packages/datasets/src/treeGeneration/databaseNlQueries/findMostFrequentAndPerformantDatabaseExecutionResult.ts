import { fuzzyMatchExecutionResults } from "mongodb-rag-core/executeCode";
import { DatabaseExecutionResultNode } from "./databaseNodes/nodeTypes";
import {
  findLargestCluster,
  fuzzyClusterItems,
  FuzzyMatch,
  getClusterElementsFromIndexes,
} from "../fuzzyClusterItems";

export const fuzzyMatchDatabaseExecutionResults: FuzzyMatch<
  DatabaseExecutionResultNode["data"]
> = function (a, b) {
  if (a.result === null && b.result === null) return true;
  if (a.result === null || b.result === null) return false;
  try {
    return fuzzyMatchExecutionResults({
      mongoDbOutput: a.result,
      expected: b.result,
      allowedNumberDifference: 0.01,
      isAggregation: a.methods?.includes("aggregation") ?? false,
      orderMatters:
        (a.methods?.includes("sort") || a.queryOperators?.includes("$sort")) ??
        false,
    });
  } catch (e) {
    console.error(e);
    return null;
  }
};

export function fuzzyClusterDatabaseExecutionResults(
  items: DatabaseExecutionResultNode["data"][]
): number[][] {
  return fuzzyClusterItems(items, fuzzyMatchDatabaseExecutionResults);
}

export function getClusterFastestExecutionTimeExecutionResultIndex(
  cluster: DatabaseExecutionResultNode["data"][] | null
): number | null {
  if (cluster === null || cluster.length === 0) return null;

  let fastestIndex = 0;
  let fastestTime = cluster[0].executionTimeMs ?? Infinity;

  for (let i = 1; i < cluster.length; i++) {
    const currentTime = cluster[i].executionTimeMs ?? Infinity;
    if (currentTime < fastestTime) {
      fastestIndex = i;
      fastestTime = currentTime;
    }
  }

  return fastestIndex;
}

export function findMostFrequentAndPerformantDatabaseExecutionResult(
  items: DatabaseExecutionResultNode["data"][],
  minClusterSize = 1
) {
  const clusters = fuzzyClusterDatabaseExecutionResults(items);
  const largestCluster = findLargestCluster(clusters);
  if (largestCluster.length < minClusterSize)
    return { clusters, fastestMostFrequentIndex: null };
  const clusterItems = getClusterElementsFromIndexes(items, largestCluster);
  const fastestMostFrequentIndex =
    getClusterFastestExecutionTimeExecutionResultIndex(clusterItems);

  return { clusters, fastestMostFrequentIndex };
}
