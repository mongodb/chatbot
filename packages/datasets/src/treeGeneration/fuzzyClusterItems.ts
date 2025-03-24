import { strict as assert } from "assert";
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
      if (!used[j] && fuzzyMatch(items[i], items[j]) === true) {
        cluster.push(j);
        used[j] = true;
      }
    }
    clusters.push(cluster);
  }
  return clusters;
}

export function findLargestCluster(clusters: number[][]): number[] {
  assert(clusters.length > 0, "Cannot find largest cluster in an empty array");
  return clusters.reduce((largest, current) => {
    return current.length > largest.length ? current : largest;
  }, clusters[0]);
}

export function getClusterElementsFromIndexes<T>(
  items: T[],
  indexes: number[]
): T[] {
  assert(
    indexes.every((index) => index < items.length),
    `Index out of bounds. Indexes: ${indexes}. Max index: ${items.length - 1}`
  );
  return indexes.map((index) => items[index]);
}
