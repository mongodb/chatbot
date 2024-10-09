/**
  Calculate Average Precision (AP) for a single query.

  Average Precision is the average of the precision scores at each rank where a relevant item appears.

  @param relevantItems - List of relevant items
  @param retrievedItems - List of retrieved items
  @param k - Value of k (top-k results to consider)
  @returns Average Precision (AP)
 */
export function averagePrecisionAtK<T>(
  relevantItems: T[],
  retrievedItems: T[],
  k: number
): number {
  let numRelevantRetrieved = 0; // Tracks how many relevant items have been retrieved
  let precisionSum = 0; // Sum of precision scores at each relevant item rank

  const limit = Math.min(k, retrievedItems.length); // Ensure we don't exceed the retrieved items or k

  // Iterate through the top k retrieved items
  for (let i = 0; i < limit; i++) {
    const item = retrievedItems[i];

    // If the item is relevant, update the relevant count and add the precision at this rank
    if (relevantItems.includes(item)) {
      numRelevantRetrieved++;
      precisionSum += numRelevantRetrieved / (i + 1); // Precision at rank (i + 1 because it's 1-based)
    }
  }

  // Return the average precision, or 0 if there are no relevant items
  return relevantItems.length === 0 ? 0 : precisionSum / relevantItems.length;
}
