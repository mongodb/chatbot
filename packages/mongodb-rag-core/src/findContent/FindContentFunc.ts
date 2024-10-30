import { EmbeddedContent } from "../contentStore/EmbeddedContent";
import { WithScore } from "../VectorStore";

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
