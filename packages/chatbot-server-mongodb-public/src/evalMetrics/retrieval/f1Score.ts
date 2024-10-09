import { precisionAtK } from "./precisionAtK";
import { recallAtK } from "./recallAtK";

/**
  Calculate F1@K.

  The F1-score is the harmonic mean of Precision@K and Recall@K.
  It provides a balance between precision and recall.

  @param relevantItems - List of relevant items
  @param retrievedItems - List of retrieved items
  @param k - Value of k (top-k results to consider)
  @returns F1@k
 */
export function f1AtK<T>(
  relevantItems: T[],
  retrievedItems: T[],
  k = 5
): number {
  // Calculate precision@k using the existing function
  const precision = precisionAtK(relevantItems, retrievedItems, k);

  // Calculate recall@k using the existing function
  const recall = recallAtK(relevantItems, retrievedItems, k);

  // If both precision and recall are 0, F1 is undefined (avoid division by zero)
  if (precision === 0 && recall === 0) {
    return 0;
  }

  // Calculate the F1-score as the harmonic mean of precision and recall
  const f1 = (2 * (precision * recall)) / (precision + recall);

  return f1;
}
