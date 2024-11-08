import { assertKIsValid } from "./assertKIsValid";
import { MatchFunc } from "./MatchFunc";
import { Primitive } from "./Primitive";

/**
  Calculate [Recall@K](https://datascience.stackexchange.com/questions/92247/precisionk-and-recallk)
  Assesses how many relevant items were retrieved in the top-k retrievals, counting only the first match for each relevant item.
  @param relevantItems - List of relevant items
  @param retrievedItems - List of retrieved items
  @param matchFunc - Function to compare items for equality
  @param k - Value of k (top-k results to consider)
  @returns Recall@K
 */
export function recallAtK<T extends Primitive>(
  relevantItems: T[],
  retrievedItems: T[],
  matchFunc: MatchFunc<T>,
  k: number
): number {
  assertKIsValid(k);

  // Handle division-by-zero by returning 0 if there are no relevant items
  if (relevantItems.length === 0) {
    return 0;
  }

  const topKRetrieved = retrievedItems.slice(0, k);
  const matchedRelevantItems = new Set<T>(); // To track unique matches

  // Count unique relevant items found in the top K retrieved items
  topKRetrieved.forEach((item) => {
    const match = relevantItems.find(
      (relevantItem) =>
        matchFunc(relevantItem, item) && !matchedRelevantItems.has(relevantItem)
    );
    if (match) {
      matchedRelevantItems.add(match); // Add only the first match
    }
  });

  // Calculate recall@k
  const recall = matchedRelevantItems.size / relevantItems.length;

  return recall;
}
