/**
  Calculate Reciprocal Rank (RR).

  Assesses the rank of the first relevant item in the retrieved list
  and returns the reciprocal (1/rank) of that rank.

  @param relevantItems - List of relevant items
  @param retrievedItems - List of retrieved items
  @returns Reciprocal Rank or 0 if no relevant item is found
 */
export function reciprocalRank<T>(
  relevantItems: T[],
  retrievedItems: T[]
): number {
  // Find the rank (1-based) of the first relevant item in the retrieved list
  for (let rank = 0; rank < retrievedItems.length; rank++) {
    if (relevantItems.includes(retrievedItems[rank])) {
      return 1 / (rank + 1); // Reciprocal rank is 1 / (position + 1)
    }
  }

  // If no relevant item is found, return 0
  return 0;
}
