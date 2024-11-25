import {
  EmbeddedContent,
  Embedder,
  EmbeddedContentStore,
  FindNearestNeighborsOptions,
  WithScore,
} from "mongodb-rag-core";

export type FindContentArgs = {
  query: string;
};

export type FindContentResult = {
  queryEmbedding: number[];
  content: WithScore<EmbeddedContent>[];
};

export type FindContent = ({
  query,
}: FindContentArgs) => Promise<FindContentResult>;

export type MakeFindContentArgs = {
  embedder: Embedder;
  embeddedContentStore: EmbeddedContentStore;
  findNearestNeighborsOptions?: Partial<FindNearestNeighborsOptions>;
  // searchBoosters?: SearchBooster[];
};

export function makeFindContent({
  embedder,
  embeddedContentStore,
  findNearestNeighborsOptions,
}: MakeFindContentArgs): {
  findContent: FindContent;
  cleanup: () => Promise<void>;
} {
  const findContent: FindContent = async ({ query }) => {
    const { embedding } = await embedder.embed({
      text: query,
    });

    const embeddedContent = await embeddedContentStore.findNearestNeighbors(
      embedding,
      findNearestNeighborsOptions
    );

    return { queryEmbedding: embedding, content: embeddedContent };
  };

  const cleanup = async () => {
    // embeddedContentStore.close?.();
    return;
  };

  return { findContent, cleanup };
}
