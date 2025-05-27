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
  const uniqueReferenceChunks = chunks.filter((chunk) => {
    if (!uniqueUrls.has(chunk.url)) {
      uniqueUrls.add(chunk.url);
      return true; // Keep the referencesas it has a unique URL
    }
    return false; // Discard the referencesas its URL is not unique
  });

  return uniqueReferenceChunks.map((chunk) => {
    const url = new URL(chunk.url).href;
    // Ensure title is always a string by checking its type
    const pageTitle = chunk.metadata?.pageTitle;
    const title = typeof pageTitle === "string" ? pageTitle : url;
    const sourceName = chunk.sourceName;

    return {
      title,
      url,
      metadata: {
        sourceName,
        tags: chunk.metadata?.tags ?? [],
      },
    };
  }) satisfies References;
};
