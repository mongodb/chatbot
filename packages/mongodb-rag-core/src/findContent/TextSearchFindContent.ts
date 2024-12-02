import { MongoDbEmbeddedContentStore } from "../contentStore";
import { HybridSearchConfigParams } from "./HybridSearchConfigParams";

export type MakeTextSearchFindContentParams = {
  store: MongoDbEmbeddedContentStore;
  config: Pick<HybridSearchConfigParams, "fts" | "limit">;
};

/**
  Find content using Atlas Search with **full text search**.
 */
export const makeTextSearchFindContent = ({
  store,
  config,
}: MakeTextSearchFindContentParams) => {
  return async ({
    query,
    originalQuery,
    metadata,
  }: {
    query: string;
    originalQuery?: string;
    metadata?: {
      productName?: string;
      programmingLanguage?: string;
    };
  }) => {
    const content = await store.fullTextSearch({
      ...config.fts,
      query,
      originalQuery,
      metadata,
      limit: config.limit,
    });
    return { content };
  };
};
