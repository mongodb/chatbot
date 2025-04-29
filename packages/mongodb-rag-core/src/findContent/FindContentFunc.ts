import { EmbeddedContent } from "../contentStore/EmbeddedContent";
import { WithScore } from "../VectorStore";

export type FindContentFuncArgs<
  Filters extends Record<string, unknown> = {}
> = {
  query: string;
  filters: Filters
};

export type FindContentFunc = (
  args: FindContentFuncArgs
) => Promise<FindContentResult>;

export type FindContentResult = {
  queryEmbedding: number[];
  content: WithScore<EmbeddedContent>[];
  embeddingModelName?: string;
};
