import { EmbeddedContent, WithScore } from "mongodb-rag-core";
import { MongoDbDocsSearchResultItem } from "./searchMongoDbDocs";
import { fuzzyLinkMatch } from "./fuzzyLinkMatch";

export function withRrfScore<T>(arr: T[], k = 60): WithScore<T>[] {
  return arr.map((item, i) => {
    const itemWithScore = item as WithScore<T>;
    itemWithScore.score = calculateReciprocalRank(i, k);
    return itemWithScore;
  });
}

function calculateReciprocalRank(i: number, k = 60) {
  return 1 / (i + 1 + k);
}

export interface AugmentSearchWithDocsRrfParams {
  primaryResultSet: {
    content: WithScore<EmbeddedContent>[];
    weight: number;
  };

  secondaryResultSet: {
    content: {
      url: string;
    }[];
    weight: number;
  };
  k?: number;
}

export function augmentSearchWithRrf({
  primaryResultSet,
  secondaryResultSet,
  k = 5,
}: AugmentSearchWithDocsRrfParams): WithScore<EmbeddedContent>[] {
  const resultsWithRankScore = withRrfScore(primaryResultSet.content);
  const docsResultsWithRankScore = withRrfScore(secondaryResultSet.content);
  // TODO: come up with a more efficient way to do this
  const fusionResults = resultsWithRankScore
    .map((r) => {
      const matchingDocResult = docsResultsWithRankScore.find((d) =>
        fuzzyLinkMatch(r.url, d.url)
      );
      r.score =
        r.score * primaryResultSet.weight +
        (matchingDocResult?.score ?? 0) * secondaryResultSet.weight;
      return r;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, k);

  return fusionResults;
}
