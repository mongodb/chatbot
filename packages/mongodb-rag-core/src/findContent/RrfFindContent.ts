import { MongoDbEmbeddedContentStore, RrfConfig } from "../contentStore";
import { Embedder } from "../embed";
import { FindContentFunc } from "./FindContentFunc";

export type MakeRrfFindContentParams = {
  embedder: Embedder;
  store: MongoDbEmbeddedContentStore;
  config: {
    vectorSearch: Omit<
      RrfConfig["vectorSearch"],
      "embedding" | "embeddingPath"
    >;
    fts: Omit<RrfConfig["fts"], "query" | "path">;
    limit: RrfConfig["limit"];
    k?: RrfConfig["k"];
  };
};

/**
  Find content using hybrid search  with Atlas Vector Search, FTS, and reciprocal rank fusion.
 */
export const makeRrfFindContent = ({
  embedder,
  store,
  config,
}: MakeRrfFindContentParams): FindContentFunc => {
  return async ({ query }) => {
    const { embedding } = await embedder.embed({
      text: query,
    });

    const content = await store.hybridSearchRrf({
      ...config,
      fts: {
        ...config.fts,
        query,
        path: store.metadata.ftsPath,
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
