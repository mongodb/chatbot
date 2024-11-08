import { makeMongoDbEmbeddedContentStore } from "../contentStore";
import { FindContentFunc } from "./FindContentFunc";
import { FindNearestNeighborsOptions } from "../VectorStore";

export type MakeFtsFindContentFuncArgs = {
  store: ReturnType<typeof makeMongoDbEmbeddedContentStore>;
  findNearestNeighborsOptions?: Partial<FindNearestNeighborsOptions>;
};

export const makeFtsFindContent = ({
  store,
}: MakeFtsFindContentFuncArgs): FindContentFunc => {
  return async ({ query }) => {
    const res = await store.fullTextSearch({
      query,
      options: {
        limit: 5,
        indexName: "default",
        minScore: 0.5,
        path: "n/a",
      },
    });
    return { queryEmbedding: [], content: res };
  };
};
