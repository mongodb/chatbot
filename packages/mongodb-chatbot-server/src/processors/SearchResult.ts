import { EmbeddedContent } from "mongodb-rag-core";

export type SearchResult = Partial<EmbeddedContent> & {
  url: string;
  text: string;
  metadata?: Record<string, unknown>;
};
