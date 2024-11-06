import { MatchFunc } from "./MatchFunc";
import { Primitive } from "./Primitive";

/**
  Calculate binary Normalized Discounted Cumulative Gain (NDCG) at rank K.
  NDCG is a measure of ranking quality that evaluates how well the retrieved
  results are ordered by relevance, considering the position of each result.
  For binary relevance (relevant or not relevant), relevance scores are 1 or 0.

  @param relevantItems - List of expected relevant items (all with relevance score 1).
  @param retrievedItems - List of retrieved items to evaluate.
  @param matchFunc - Function to compare items for equality.
  @param k - Cutoff rank (top-k results to consider).
  @returns Binary NDCG at rank K.
 */
export function binaryNdcgAtK<T extends Primitive>(
  relevantItems: T[],
  retrievedItems: T[],
  matchFunc: MatchFunc<T>,
  k: number
): number {
  const limit = Math.min(k, retrievedItems.length);
  const matchedRelevantItems = new Set<T>();
  const relevanceScores = [];

  for (let i = 0; i < limit; i++) {
    const item = retrievedItems[i];
    const isRelevant = relevantItems.some(
      (relevantItem) =>
        matchFunc(relevantItem, item) && !matchedRelevantItems.has(relevantItem)
    );
    if (isRelevant) {
      matchedRelevantItems.add(item);
      relevanceScores.push(1);
    } else {
      relevanceScores.push(0);
    }
  }

  // Use the ndcg function to calculate NDCG
  return ndcg(relevanceScores);
}
/**
  Normalized Discounted Cumulative Gain (NDCG)
 */
function ndcg(scores: number[]) {
  const actualDcg = dcg(scores);
  const idealDcg = dcg(ideal(scores));
  return idealDcg === 0 ? 0 : actualDcg / idealDcg;
}

function dcg(scores: number[]) {
  return scores.reduce((sum, gain, i) => sum + gain / Math.log2(i + 2), 0);
}

function ideal(scores: number[]) {
  return scores.slice().sort((a, b) => b - a);
}
