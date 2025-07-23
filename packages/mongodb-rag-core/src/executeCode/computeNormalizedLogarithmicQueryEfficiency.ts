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
  - Formula: 1 - log((n_examined+eps2)/(n_returned+eps2)) / log((n_total+eps1)/(n_returned+eps2))
  - Uses epsilon values for numerical stability and to handle zero-result queries

  @returns A score between 0 and 1
 */
export function computeNormalizedLogarithmicQueryEfficiency({
  nReturned,
  nExamined,
  nTotal,
}: ComputeNormalizedLogarithmicQueryEfficiencyParams): number {
  assert(
    nReturned >= 0 && nExamined >= 0 && nTotal > 0,
    "Document counts must be non-negative, and total must be > 0"
  );
  assert(
    nExamined >= nReturned,
    "Documents examined must be >= documents returned"
  );

  assert(nTotal >= nExamined, "Total documents must be >= documents examined");

  // Epsilon values for numerical stability
  const eps1 = 0.1; // Added to nTotal
  const eps2 = 0.01; // Added to nReturned and nExamined

  // Formula with epsilon smoothing
  const efficiency =
    1 -
    Math.log((nExamined + eps2) / (nReturned + eps2)) /
      Math.log((nTotal + eps1) / (nReturned + eps2));

  // Clamp between 0 and 1
  return Math.max(0, Math.min(1, efficiency));
}
