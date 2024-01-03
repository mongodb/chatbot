import { EmbeddedContent, References } from "mongodb-rag-core";

/**
  Function that generates the references in the response to user.
 */
export type MakeReferenceLinksFunc = (chunks: EmbeddedContent[]) => References;
