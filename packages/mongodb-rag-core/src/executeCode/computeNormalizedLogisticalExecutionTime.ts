import { strict as assert } from "assert";
/**
  Computes a normalized execution time score comparing a generated query's execution time
  to a reference execution time. The score ranges from 0 to 1, where:
 
  - 1 means the generated query is as fast or faster than the reference
  - 0 means the generated query is significantly slower
  - Score is computed using a logistical function with a configurable alpha parameter

  @param generatedTimeMs - Execution time of the generated query in milliseconds
  @param referenceTimeMs - Reference (ideal) execution time in milliseconds
  @returns A score between 0 and 1
 */
export function computeNormalizedLogisticalExecutionTime(
  generatedTimeMs: number,
  referenceTimeMs: number,
  alpha = 1
): number {
  assert(
    generatedTimeMs > 0 && referenceTimeMs > 0,
    "Execution times must be greater than 0"
  );

  const ratio = generatedTimeMs / referenceTimeMs;
  const score = 1 / (1 + alpha * (ratio - 1));
  return Math.max(0, Math.min(1, score));
}
