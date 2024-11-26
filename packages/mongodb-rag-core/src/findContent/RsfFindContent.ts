import { MongoDbEmbeddedContentStore } from "../contentStore";
import { Embedder } from "../embed";
import { HybridSearchConfigParams } from "./HybridSearchConfigParams";

export type MakeRsfFindContentParams = {
  embedder: Embedder;
  store: MongoDbEmbeddedContentStore;
  config: HybridSearchConfigParams;
};

/**
  Find content using hybrid search  with Atlas Vector Search, FTS, and **relative score fusion**.
 */
export const makeRsfFindContent = ({
  embedder,
  store,
  config,
}: MakeRsfFindContentParams) => {
  return async ({ query, ftsQuery }: { query: string; ftsQuery?: string }) => {
    const { embedding } = await embedder.embed({
      text: query,
    });

    const content = await store.hybridSearchRsf({
      ...config,
      fts: {
        ...config.fts,
        query: ftsQuery ?? query,
      },
      vectorSearch: {
        ...config.vectorSearch,
        embedding,
        embeddingPath: store.metadata.embeddingPath,
      },
    });
    return { queryEmbedding: embedding, content };
  };
};
