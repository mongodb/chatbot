import { EmbeddedContent } from "../contentStore/EmbeddedContent";
import { WithScore } from "../VectorStore";

type VectorSearchFilters = {
  sourceName?: string;
  "metadata.version.isCurrent"?: boolean;
  "metadata.version.label"?: string;
};

export type FindContentFuncArgs = {
  query: string;
  filters?: VectorSearchFilters;
};

export type FindContentFunc = (
  args: FindContentFuncArgs
) => Promise<FindContentResult>;

export type FindContentResult = {
  queryEmbedding: number[];
  content: WithScore<EmbeddedContent>[];
  embeddingModelName?: string;
};
