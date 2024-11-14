import { EmbeddedContent } from "../contentStore/EmbeddedContent";

export type FindContentFuncArgs = {
  query: string;
};

export type FindContentFunc = (
  args: FindContentFuncArgs
) => Promise<FindContentResult>;

export type FindContentResult = {
  queryEmbedding: number[];
  content: EmbeddedContent[];
};
