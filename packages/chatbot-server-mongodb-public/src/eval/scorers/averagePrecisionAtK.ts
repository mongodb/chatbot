import { assertKIsValid } from "./assertKIsValid";
import { MatchFunc } from "./MatchFunc";
import { Primitive } from "./Primitive";

/**
  Calculate Average Precision (AP) for a single query.
  Average Precision is the average of the precision scores at each rank where a relevant item appears.
  @param relevantItems - List of relevant items
  @param retrievedItems - List of retrieved items
  @param matchFunc - Function to compare items for equality
  @param k - Value of k (top-k results to consider)
  @returns Average Precision (AP)
 */
export function averagePrecisionAtK<T extends Primitive>(
  relevantItems: T[],
  retrievedItems: T[],
  matchFunc: MatchFunc<T>,
  k: number
): number {
  assertKIsValid(k);

  let numRelevantRetrieved = 0;
  let precisionSum = 0;
  const retrievedRelevantItems = new Set<T>();

  const limit = Math.min(k, retrievedItems.length);

  for (let i = 0; i < limit; i++) {
    const item = retrievedItems[i];

    // Find the matching relevant item
    const relevantItem = relevantItems.find((relevantItem) =>
      matchFunc(relevantItem, item)
    );

    if (relevantItem) {
      if (!retrievedRelevantItems.has(relevantItem)) {
        retrievedRelevantItems.add(relevantItem);
        numRelevantRetrieved++;
        precisionSum += numRelevantRetrieved / (i + 1);
      }
    }
  }

  return relevantItems.length === 0 ? 0 : precisionSum / relevantItems.length;
}
