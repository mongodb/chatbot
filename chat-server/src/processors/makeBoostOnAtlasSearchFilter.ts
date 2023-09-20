import {
  WithScore,
  EmbeddedContent,
  FindNearestNeighborsOptions,
  EmbeddedContentStore,
} from "chat-core";
import { SearchBooster } from "./SearchBooster";

export type WithFilterAndK<T> = T & {
  filter: Record<string, unknown>;
  k: number;
};
type FindNearestNeighborOptionsWithFilterAndK = WithFilterAndK<
  Partial<FindNearestNeighborsOptions>
>;

/**
 OSS_TODO: add tsdoc description of this
 */
export function makeBoostOnAtlasSearchFilter({
  findNearestNeighborsOptions,
  totalMaxK,
  shouldBoostFunc,
}: {
  findNearestNeighborsOptions: FindNearestNeighborOptionsWithFilterAndK;
  totalMaxK: number;
  shouldBoostFunc: ({ text }: { text: string }) => boolean;
}): SearchBooster {
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
