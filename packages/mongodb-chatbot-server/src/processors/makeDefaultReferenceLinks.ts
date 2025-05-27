import { References } from "mongodb-rag-core";
import { MakeReferenceLinksFunc } from "./MakeReferenceLinksFunc";

/**
  The default reference format returns the following for chunks from _unique_ pages:

  ```js
  {
    title: chunk.metadata.pageTitle ?? chunk.url, // if title doesn't exist, just put url
    url: chunk.url // this always exists
  }
  ```
 */
export const makeDefaultReferenceLinks: MakeReferenceLinksFunc = (chunks) => {
  // Filter chunks with unique URLs
  const uniqueUrls = new Set();
  const uniqueReferences = chunks.filter((chunk) => {
    if (!uniqueUrls.has(chunk.url)) {
      uniqueUrls.add(chunk.url);
      return true; // Keep the referencesas it has a unique URL
    }
    return false; // Discard the referencesas its URL is not unique
  });

  return uniqueReferences.map((reference) => {
    const url = new URL(reference.url).href;
    // Ensure title is always a string by checking its type
    const pageTitle = reference.metadata?.pageTitle;
    const title = typeof pageTitle === "string" ? pageTitle : url;
    const sourceName =
      typeof reference.metadata?.sourceName === "string"
        ? reference.metadata?.sourceName
        : undefined;
    return {
      title,
      url,
      metadata: {
        sourceName,
        tags: reference.metadata?.tags ?? [],
      },
    };
  }) satisfies References;
};
