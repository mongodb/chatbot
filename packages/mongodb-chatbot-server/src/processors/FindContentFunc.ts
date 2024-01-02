import { WithScore, EmbeddedContent } from "mongodb-rag-core";

export type FindContentFuncArgs = {
  query: string;
};

export type FindContentFunc = (
  args: FindContentFuncArgs
) => Promise<FindContentResult>;

export type FindContentResult = {
  queryEmbedding: number[];
  content: WithScore<EmbeddedContent>[];
};
