/**
  Calculate [Recall@K](https://datascience.stackexchange.com/questions/92247/precisionk-and-recallk)
  Assesses how many relevant items were retrieved in the top-k retrievals.
  @param relevantItems - List of relevant items
  @param retrievedItems - List of retrieved items
  @param k - Value of k (top-k results to consider)
  @returns
 */
export function recallAtK<T>(
  relevantItems: T[],
  retrievedItems: T[],
  k: number
): number {
  // Ensure k is not greater than the number of retrieved items
  const topKRetrieved = retrievedItems.slice(0, k);

  // Find the number of relevant items in the top k retrievals
  const relevantInTopK = topKRetrieved.filter((item) =>
    relevantItems.includes(item)
  ).length;

  // Calculate recall@k
  const recall = relevantInTopK / relevantItems.length;

  return recall;
}
