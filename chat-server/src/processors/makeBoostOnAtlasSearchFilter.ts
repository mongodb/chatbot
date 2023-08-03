import {
  WithScore,
  EmbeddedContent,
  FindNearestNeighborsOptions,
  EmbeddedContentStore,
} from "chat-core";
import { SearchBooster } from "../AppConfig";

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
type FindNearestNeighborOptionsWithFilter = WithRequired<
  WithRequired<Partial<FindNearestNeighborsOptions>, "filter">,
  "k"
>;
export function makeBoostOnAtlasSearchFilter({
  findNearestNeighborsOptions,
  totalMaxK,
  shouldBoostFunc,
}: {
  findNearestNeighborsOptions: FindNearestNeighborOptionsWithFilter;
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
      return [...boostedResults, ...newResults].slice(0, totalMaxK);
    },
  };
}
