import { References, logger } from "mongodb-rag-core";
import { ensureProtocol } from "mongodb-rag-core/dataSources";
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
      return true; // Keep the reference as it has a unique URL
    }
    return false; // Discard the reference as its URL is not unique
  });

  return uniqueReferenceChunks.map((chunk) => {
    // Handle normalized URLs, add protocol if missing
    let url;
    try {
      url = new URL(ensureProtocol(chunk.url)).href;
    } catch (error) {
      logger.error(`Could not safely convert URL "${chunk.url}":`, error);
      url = chunk.url;
    }

    // Location of `title` param depends on chunk type (EmbeddedContent/Page)
    const pageTitle =
      chunk.metadata?.pageTitle ?? (hasTitle(chunk) ? chunk.title : undefined);
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

function hasTitle(obj: unknown): obj is { title: string } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof (obj as any)?.title === "string";
}
