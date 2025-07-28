import { EmbeddedContent, PersistedPage, References } from "mongodb-rag-core";

/**
  Content that can be made into a Reference. 
  */
export type ReferenceableContent =
  | (Partial<EmbeddedContent> & Pick<EmbeddedContent, "url">)
  | (Partial<PersistedPage> & Pick<PersistedPage, "url">);

/**
  Function that generates the references in the response to user.
 */
export type MakeReferenceLinksFunc = (
  searchResults: ReferenceableContent[]
) => References;
