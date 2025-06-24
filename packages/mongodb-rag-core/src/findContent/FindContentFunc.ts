import { EmbeddedContent, QueryFilters } from "../contentStore/EmbeddedContent";
import { WithScore } from "../VectorStore";

export type FindContentFuncArgs = {
  query: string;
  filters?: QueryFilters;
  limit?: number;
};

export type FindContentFunc = (
  args: FindContentFuncArgs
) => Promise<FindContentResult>;

export type FindContentResult = {
  queryEmbedding: number[];
  content: WithScore<EmbeddedContent>[];
  embeddingModelName?: string;
};
