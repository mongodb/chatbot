import assert from "node:assert/strict";

/**
  Calculates the square magnitude of an N-dimensional vector.
 */
export const squareMagnitude = (vector: number[]): number => {
  return vector.reduce((acc, cur) => acc + Math.pow(cur, 2), 0);
};

/**
  For vectors where each dimension is in [−1,1], returns a square
  magnitude normalized to [0, 1].
 */
export const normalizedSquareMagnitude = (vector: number[]): number => {
  assert(
    vector.every((value) => -1 <= value && value <= 1),
    "Vector dimension outside [-1, 1] will create meaningless normalization"
  );
  assert(vector.length > 0, "Vector must have dimensionality!");
  return squareMagnitude(vector) / vector.length;
};

/**
  Calculates the difference between square magnitude of an N-dimensional vector.
 */
export const squareMagnitudeDifference = (
  vector0: number[],
  vector1: number[]
): number => {
  assert(vector0.length === vector1.length, "Vector length mismatch!");
  return Math.abs(squareMagnitude(vector1) - squareMagnitude(vector0));
};

/**
  For two vectors where each dimension is in [−1,1], returns the absolute
  difference between their square magnitudes normalized to [0, 1].
 */
export const normalizedSquareMagnitudeDifference = (
  vector0: number[],
  vector1: number[]
): number => {
  return Math.abs(
    normalizedSquareMagnitude(vector0) - normalizedSquareMagnitude(vector1)
  );
};
