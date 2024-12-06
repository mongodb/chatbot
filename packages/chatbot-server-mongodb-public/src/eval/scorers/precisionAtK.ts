import { assertKIsValid } from "./assertKIsValid";
import { MatchFunc } from "./MatchFunc";
import { Primitive } from "./Primitive";
/**
  Calculate Precision@K.
  Assesses the proportion of relevant items in the top-k retrievals.
  Precision@k focuses on how many of the top-k retrieved items are actually relevant.
  Each relevant item is counted only once, even if it appears multiple times.
  @param relevantItems - List of relevant items
  @param retrievedItems - List of retrieved items
  @param matchFunc - Function to compare items for equality
  @param k - Value of k (top-k results to consider)
  @returns Precision@k
 */
export function precisionAtK<T extends Primitive>(
  relevantItems: T[],
  retrievedItems: T[],
  matchFunc: MatchFunc<T>,
  k = 5
): number {
  assertKIsValid(k);

  if (retrievedItems.length === 0) {
    return 0;
  }

  const limit = Math.min(k, retrievedItems.length);

  // Ensure k is not greater than the number of retrieved items
  const topKRetrieved = retrievedItems.slice(0, k);

  const matchedRelevantItems = new Set<T>(); // To track unique relevant items matched

  // Count unique relevant items in the top k predictions
  topKRetrieved.forEach((item) => {
    const match = relevantItems.find(
      (relevantItem) =>
        matchFunc(relevantItem, item) && !matchedRelevantItems.has(relevantItem)
    );
    if (match) {
      matchedRelevantItems.add(match); // Add only the first match
    }
  });

  // Calculate precision@k
  const precision = matchedRelevantItems.size / limit;

  return precision;
}
