import { strict as assert } from "assert";
import {
  WithScore,
  EmbeddedContent,
  Embedder,
  EmbeddedContentStore,
  FindNearestNeighborsOptions,
} from "chat-core";
import { SearchBooster } from "../../processors/SearchBooster";

export type FindContentFunc = ({
  query,
  ipAddress,
}: {
  query: string;
  ipAddress: string;
}) => Promise<FindContentResult>;

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
