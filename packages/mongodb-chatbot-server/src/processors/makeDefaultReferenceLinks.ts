import { References } from "mongodb-rag-core";
import { MakeReferenceLinksFunc } from "./MakeReferenceLinksFunc";

/**
  Checks if a URL string has a protocol (http:// or https://)
  @param url The URL string to check
  @returns boolean indicating whether the URL has a protocol
 */
function hasProtocol(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/**
  Ensures a URL has a protocol by adding https:// if missing
  @param url The URL string to normalize
  @returns A URL string with protocol
 */
function ensureProtocol(url: string): string {
  if (!hasProtocol(url)) {
    return `https://${url}`;
  }
  return url;
}

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
      return true; // Keep the reference as it has a unique URL
    }
    return false; // Discard the reference as its URL is not unique
  });

  return uniqueReferenceChunks.map((chunk) => {
    // Ensure URL has a protocol before creating URL object
    const normalizedUrl = ensureProtocol(chunk.url);
    const url = new URL(normalizedUrl).href;
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
