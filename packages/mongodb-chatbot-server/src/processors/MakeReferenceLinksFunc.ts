import { EmbeddedContent, References } from "mongodb-rag-core";

export type EmbeddedContentForModel = Pick<
  EmbeddedContent,
  "url" | "text" | "metadata"
>;

/**
  Function that generates the references in the response to user.
 */
export type MakeReferenceLinksFunc = (
  chunks: (Partial<EmbeddedContent> & EmbeddedContentForModel)[]
) => References;
