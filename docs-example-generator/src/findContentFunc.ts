import {
  WithScore,
  EmbeddedContent,
  Embedder,
  EmbeddedContentStore,
  FindNearestNeighborsOptions,
} from "mongodb-rag-core";
// import { SearchBooster } from "../../processors/SearchBooster";

export type FindContentArgs = {
  query: string;
};

export type FindContentResult = {
  queryEmbedding: number[];
  content: WithScore<EmbeddedContent>[];
};

export type FindContent = ({ query }: FindContentArgs) => Promise<FindContentResult>;

export type MakeDefaultFindContentArgs = {
  embedder: Embedder;
  store: EmbeddedContentStore;
  findNearestNeighborsOptions?: Partial<FindNearestNeighborsOptions>;
  // searchBoosters?: SearchBooster[];
};

/**
  Basic implementation of FindContent.
 */
export const makeDefaultFindContent = ({
  embedder,
  store,
  findNearestNeighborsOptions,
  // searchBoosters,
}: MakeDefaultFindContentArgs): FindContent => {
  return async ({ query }) => {
    const { embedding } = await embedder.embed({
      text: query,
      userIp: "::1",
    });

    let content = await store.findNearestNeighbors(
      embedding,
      findNearestNeighborsOptions
    );

    // for (const booster of searchBoosters ?? []) {
    //   if (await booster.shouldBoost({ text: query })) {
    //     content = await booster.boost({
    //       existingResults: content,
    //       embedding,
    //       store,
    //     });
    //   }
    // }

    return { queryEmbedding: embedding, content };
  };
};
