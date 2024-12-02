import { WithScore } from "mongodb-rag-core";

export function withRrfScore<T>(arr: T[], k = 60): WithScore<T>[] {
  return arr.map((item, i) => {
    const itemWithScore = item as WithScore<T>;
    itemWithScore.score = calculateRrfItemScore(i, k);
    return itemWithScore;
  });
}

function calculateRrfItemScore(i: number, k = 60) {
  return 1 / (i + 1 + k);
}
