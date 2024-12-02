import { EmbeddedContent, WithScore } from "mongodb-rag-core";
import { MongoDbDocsSearchResultItem } from "./searchMongoDbDocs";
import { withRrfScore } from "./withRrfScore";
import { fuzzyLinkMatch } from "../eval/fuzzyLinkMatch";

export interface AugmentSearchWithDocsRrfParams {
  searchResults: {
    content: WithScore<EmbeddedContent>[];
    weight: number;
  };

  docsSearchResults: {
    content: MongoDbDocsSearchResultItem[];
    weight: number;
  };
  k: number;
}

export function augmentSearchWithDocsRrf({
  searchResults,
  docsSearchResults,
  k,
}: AugmentSearchWithDocsRrfParams): WithScore<EmbeddedContent>[] {
  const resultsWithRankScore = withRrfScore(searchResults.content);
  const docsResultsWithRankScore = withRrfScore(docsSearchResults.content);
  const fusionResults = resultsWithRankScore
    .map((r) => {
      const matchingDocResult = docsResultsWithRankScore.find((d) =>
        fuzzyLinkMatch(r.url, d.url)
      );
      return {
        ...r,
        score:
          r.score * searchResults.weight +
          (matchingDocResult?.score ?? 0) * docsSearchResults.weight,
      };
    })

    .sort((a, b) => b.score - a.score)
    .slice(0, k);

  return fusionResults;
}
