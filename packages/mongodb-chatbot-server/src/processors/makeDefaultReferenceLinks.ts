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
export const makeDefaultReferenceLinks: MakeReferenceLinksFunc = (
  references
) => {
  // Filter chunks with unique URLs
  const uniqueUrls = new Set();
  const uniqueReferences = references.filter((reference) => {
    if (!uniqueUrls.has(reference.url)) {
      uniqueUrls.add(reference.url);
      return true; // Keep the referencesas it has a unique URL
    }
    return false; // Discard the referencesas its URL is not unique
  });

  return uniqueReferences.map((reference) => {
    const url = new URL(reference.url).href;
    // Ensure title is always a string by checking its type
    const pageTitle = reference.metadata?.pageTitle;
    const title = typeof pageTitle === "string" ? pageTitle : url;
    return {
      title,
      url,
      metadata: {
        sourceName: reference.metadata?.sourceName ?? "",
        tags: reference.metadata?.tags ?? [],
      },
    };
  });
};
