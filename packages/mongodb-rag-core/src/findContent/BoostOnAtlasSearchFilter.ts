import { EmbeddedContentStore, EmbeddedContent } from "../contentStore";
import { SearchBooster } from "./SearchBooster";
import { FindNearestNeighborsOptions, WithScore } from "../VectorStore";

export type WithFilterAndK<T> = T & {
  filter: Record<string, unknown>;
  k: number;
};
type FindNearestNeighborOptionsWithFilterAndK = WithFilterAndK<
  Partial<FindNearestNeighborsOptions>
>;

interface MakeBoostOnAtlasSearchFilterArgs {
  /**
    Options for performing a nearest-neighbor search for results to boost.
  */
  findNearestNeighborsOptions: FindNearestNeighborOptionsWithFilterAndK;

  /**
    Max number of results to boost.
   */
  totalMaxK: number;

  /**
    Determines if the booster should be used, based on the user's input.
   */
  shouldBoostFunc: ({ text }: { text: string }) => Promise<boolean>;
}

/**
  Boost certain results in search results from Atlas Search.
 */
export function makeBoostOnAtlasSearchFilter({
  findNearestNeighborsOptions,
  totalMaxK,
  shouldBoostFunc,
}: MakeBoostOnAtlasSearchFilterArgs): SearchBooster {
  if (findNearestNeighborsOptions.k > totalMaxK) {
    throw new Error(
      `findNearestNeighborsOptions.k (${findNearestNeighborsOptions.k}) must be less than or equal to totalMaxK (${totalMaxK})`
    );
  }
  return {
    shouldBoost: shouldBoostFunc,
    boost: async function ({
      embedding,
      store,
      existingResults,
    }: {
      embedding: number[];
      store: EmbeddedContentStore;
      existingResults: WithScore<EmbeddedContent>[];
    }) {
      const boostedResults = await store.findNearestNeighbors(
        embedding,
        findNearestNeighborsOptions
      );

      const newResults = existingResults.filter((result) =>
        boostedResults.every(
          (manualResult) => manualResult.text !== result.text
        )
      );
      return [...boostedResults, ...newResults]
        .sort((a, b) => b.score - a.score)
        .slice(0, totalMaxK);
    },
  };
}
