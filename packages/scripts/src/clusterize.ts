import dbscan from "@cdxoo/dbscan";
import { strict as assert } from "assert";

/**
  Based on https://www.npmjs.com/package/@cdxoo/dbscan
 */
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

/**
  Groups arbitrary data into clusters.
  @param dataset The collection of instances to group into clusters.
  @param getVector A function that, given an element of the dataset, returns the
  spatial position of that element.
  @param optionsIn Additional dbscan options.
 */
export const clusterize = <T>(
  dataset: T[],
  getVector: (x: T) => number[],
  optionsIn?: Partial<DbscanOptions>
): {
  /**
    Each cluster is represented as an array of the instances that fell into that
    cluster.
   */
  clusters: T[][];

  /**
    The "noise" array contains the instances that did not fall into any cluster.
   */
  noise: T[];
} => {
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
  // Pythagorean theorem: the square of the hypotenuse is equal to the sum of
  // the squares of the other sides
  return a.reduce((acc, cur, i) => acc + Math.pow(b[i] - cur, 2), 0);
};
