import { References } from "mongodb-rag-core";
import { SearchResult } from "./SearchResult";

/**
  Function that generates the references in the response to user.
 */
export type MakeReferenceLinksFunc = (
  searchResults: SearchResult[]
) => References;
