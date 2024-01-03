import dbscan from "@cdxoo/dbscan";
import { strict as assert } from "assert";

// Based on https://www.npmjs.com/package/@cdxoo/dbscan
export type DbscanOptions = {
  /**
    Maximum distance between datapoints. Determine if a datapoint is in a
    cluster or not. Default is 1.0.
   */
  epsilon: number;

  /**
    Custom function to compare calculated distance and epsilon. Default is
    (dist, e) => (dist < e)
   */
  epsilonCompare: (distance: number, epsilon: number) => boolean;

  /**
    Threshold of how many points are needed in the same neighborhood to form a
    cluster. Default is 2.
   */
  minimumPoints: number;
};

const defaultDbscanOptions: DbscanOptions = {
  epsilon: 1.0,
  epsilonCompare: (d, e) => d < e,
  minimumPoints: 2,
};

export const clusterize = <T>(
  dataset: T[],
  getVector: (x: T) => number[],
  optionsIn?: Partial<DbscanOptions>
): { clusters: T[][]; noise: T[] } => {
  if (dataset.length === 0) {
    return { clusters: [], noise: [] };
  }

  const options: DbscanOptions = {
    ...defaultDbscanOptions,
    ...(optionsIn ?? {}),
  };

  const { clusters: clusterIndexesArray, noise: noiseIndexes } = dbscan({
    ...options,
    dataset,
    distanceFunction(a, b) {
      return distanceSquared(getVector(a), getVector(b));
    },
  });

  return {
    clusters: clusterIndexesArray.map((indexes) =>
      indexes.map((index) => dataset[index])
    ),
    noise: noiseIndexes.map((index) => dataset[index]),
  };
};

export const distanceSquared = (a: number[], b: number[]) => {
  assert(
    a.length === b.length,
    "Unexpected inconsistent dimensionality in distanceFunction"
  );
  // Pythagoras: the square of the hypotenuse is equal to the sum of the squares
  // of the other sides
  return a.reduce((acc, cur, i) => acc + Math.pow(b[i] - cur, 2), 0);
};
