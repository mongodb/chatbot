import { strict as assert } from "assert";

export interface ComputeNormalizedLogarithmicQueryEfficiencyParams {
  /**  Number of documents returned by the query */
  nReturned: number;
  /** Number of documents examined by the query */
  nExamined: number;
  /** Total number of documents in the collection. */
  nTotal: number;
}
/**
  Computes a normalized query efficiency score based on the logarithmic relationship
  between documents examined and documents returned. The score ranges from 0 to 1, where:
 
  - 1 means perfect efficiency (n_examined = n_returned)
  - 0 means full scan with minimal results
  - Score decreases logarithmically as examination overhead increases
  - Formula: 1 - log(n_examined/n_returned) / log(n_total/n_returned)

  @returns A score between 0 and 1
 */
export function computeNormalizedLogarithmicQueryEfficiency({
  nReturned,
  nExamined,
  nTotal,
}: ComputeNormalizedLogarithmicQueryEfficiencyParams): number {
  assert(
    nReturned > 0 && nExamined > 0 && nTotal > 0,
    "All document counts must be greater than 0"
  );
  assert(
    nExamined >= nReturned,
    "Documents examined must be >= documents returned"
  );

  assert(nTotal >= nExamined, "Total documents must be >= documents examined");

  // Perfect efficiency case
  if (nExamined === nReturned) {
    return 1.0;
  }

  // Avoid edge case where nReturned equals nTotal
  if (nReturned === nTotal) {
    return nExamined === nTotal ? 1.0 : 0.0;
  }

  const efficiency =
    1 - Math.log(nExamined / nReturned) / Math.log(nTotal / nReturned);

  // Clamp between 0 and 1
  return Math.max(0, Math.min(1, efficiency));
}
