import { strict as assert } from "assert";
import {
  WithScore,
  EmbeddedContent,
  Embedder,
  EmbeddedContentStore,
  FindNearestNeighborsOptions,
} from "mongodb-rag-core";
import { SearchBooster } from "../../processors/SearchBooster";

export type FindContentFuncArgs = {
  query: string;
  ipAddress: string;
};

export type FindContentFunc = (
  args: FindContentFuncArgs
) => Promise<FindContentResult>;

export type FindContentResult = {
  queryEmbedding: number[];
  content: WithScore<EmbeddedContent>[];
};

export type MakeDefaultFindContentFuncArgs = {
  embedder: Embedder;
  store: EmbeddedContentStore;
  findNearestNeighborsOptions?: Partial<FindNearestNeighborsOptions>;
  searchBoosters?: SearchBooster[];
};

/**
  Basic implementation of FindContentFunc with search boosters.
 */
export const makeDefaultFindContentFunc = ({
  embedder,
  store,
  findNearestNeighborsOptions,
  searchBoosters,
}: MakeDefaultFindContentFuncArgs): FindContentFunc => {
  return async ({ query, ipAddress }) => {
    const { embedding } = await embedder.embed({
      text: query,
      userIp: ipAddress,
    });

    const content = [];
    const highContent = await store.findNearestNeighbors(embedding, {
      k: 5,
      filter: {
        "metadata.weight": "high",
      },
    });
    content.push(...highContent);
    if (content.length < 5) {
      const mediumContent = await store.findNearestNeighbors(embedding, {
        k: 5 - content.length,
        filter: {
          "metadata.weight": "medium",
        },
      });
      content.push(...mediumContent);
    }
    //...same for low
    // sort by score so that low is on top

    return { queryEmbedding: embedding, content };
  };
};
