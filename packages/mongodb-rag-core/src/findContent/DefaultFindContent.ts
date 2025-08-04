import { EmbeddedContentStore, QueryFilters } from "../contentStore";
import { Embedder } from "../embed";
import { FindContentFunc } from "./FindContentFunc";
import { FindNearestNeighborsOptions } from "../VectorStore";

export type MakeDefaultFindContentFuncArgs = {
  embedder: Embedder;
  store: EmbeddedContentStore;
  findNearestNeighborsOptions?: Partial<
    FindNearestNeighborsOptions<QueryFilters>
  >;
};

/**
  Basic implementation of FindContentFunc with search boosters.
 */
export const makeDefaultFindContent = ({
  embedder,
  store,
  findNearestNeighborsOptions,
}: MakeDefaultFindContentFuncArgs): FindContentFunc => {
  return async ({ query, filters = {}, limit }) => {
    const { embedding } = await embedder.embed({
      text: query,
    });

    const content = await store.findNearestNeighbors(embedding, {
      ...findNearestNeighborsOptions,
      filter: filters,
      ...(limit ? { k: limit } : {}),
    });

    return {
      queryEmbedding: embedding,
      content,
      embeddingModelName: embedder.modelName,
    };
  };
};
