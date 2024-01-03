import { strict as assert } from "assert";

/**
  Finds the barycenter (center of mass) of a set of equally-weighted
  n-dimensional vectors.
 */
export const barycenter = (vectors: number[][]) => {
  assert(vectors.length > 0, "Cannot find barycenter of 0 vectors!");
  assert(
    vectors.find((vector) => vectors[0].length !== vector.length) === undefined,
    "Vector dimensionality mismatch!"
  );
  return (
    vectors
      // Add all vectors together into one vector (add each dimension together)
      .reduce((acc, cur) => cur.map((d, i) => (acc[i] ?? 0) + d), [])
      // Average each dimension of the combined vector
      .map((d) => d / vectors.length)
  );
};
