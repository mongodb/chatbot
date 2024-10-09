/**
  Calculate Precision@K.

  Assesses the proportion of relevant items in the top-k retrievals.
  Precision@k focuses on how many of the top-k retrieved items are actually relevant.

  @param relevantItems - List of relevant items
  @param retrievedItems - List of retrieved items
  @param k - Value of k (top-k results to consider)
  @returns Precision@k
 */
export function precisionAtK<T>(
  relevantItems: T[],
  retrievedItems: T[],
  k = 5
): number {
  // Ensure k is not greater than the number of retrieved items
  const topKRetrieved = retrievedItems.slice(0, k);

  // Find the number of relevant items in the top k predictions
  const relevantInTopK = topKRetrieved.filter((item) =>
    relevantItems.includes(item)
  ).length;

  // Calculate precision@k
  const precision = relevantInTopK / k;

  return precision;
}
