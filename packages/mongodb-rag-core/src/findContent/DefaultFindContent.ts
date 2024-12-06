import { EmbeddedContentStore } from "../contentStore";
import { Embedder } from "../embed";
import { FindContentFunc } from "./FindContentFunc";
import { SearchBooster } from "./SearchBooster";
import { FindNearestNeighborsOptions } from "../VectorStore";

export type MakeDefaultFindContentFuncArgs = {
  embedder: Embedder;
  store: EmbeddedContentStore;
  findNearestNeighborsOptions?: Partial<FindNearestNeighborsOptions>;
  searchBoosters?: SearchBooster[];
};

/**
  Basic implementation of FindContentFunc with search boosters.
 */
export const makeDefaultFindContent = ({
  embedder,
  store,
  findNearestNeighborsOptions,
  searchBoosters,
}: MakeDefaultFindContentFuncArgs): FindContentFunc => {
  return async ({ query }) => {
    const { embedding } = await embedder.embed({
      text: query,
    });

    let content = await store.findNearestNeighbors(
      embedding,
      findNearestNeighborsOptions
    );

    for (const booster of searchBoosters ?? []) {
      if (await booster.shouldBoost({ text: query })) {
        content = await booster.boost({
          existingResults: content,
          embedding,
          store,
        });
      }
    }
    return { queryEmbedding: embedding, content };
  };
};
