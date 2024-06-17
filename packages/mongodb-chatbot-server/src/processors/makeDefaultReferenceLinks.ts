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
  const uniqueChunks = chunks.filter((chunk) => {
    if (!uniqueUrls.has(chunk.url)) {
      uniqueUrls.add(chunk.url);
      return true; // Keep the chunk as it has a unique URL
    }
    return false; // Discard the chunk as its URL is not unique
  });

  return uniqueChunks.map((chunk) => {
    const url = new URL(chunk.url).href;
    const title = chunk.metadata?.pageTitle ?? url;
    return {
      title,
      url,
      metadata: {
        sourceName: chunk.sourceName,
        tags: chunk.metadata?.tags ?? [],
      },
    };
  });
};
