import { EmbeddedContent } from "../contentStore/EmbeddedContent";
import { QueryFilters, WithScore } from "../VectorStore";

export type FindContentFuncArgs = {
  query: string;
  filters?: QueryFilters;
};

export type FindContentFunc = (
  args: FindContentFuncArgs
) => Promise<FindContentResult>;

export type FindContentResult = {
  queryEmbedding: number[];
  content: WithScore<EmbeddedContent>[];
  embeddingModelName?: string;
};
