import { createHash } from "crypto";
import { PromisePool } from "@supercharge/promise-pool";
import { ChunkOptions, ChunkFunc, chunkPage } from "../chunk";
import { EmbeddedContentStore } from "./EmbeddedContent";
import { Embedder } from "../embed";
import { logger } from "../logger";
import { PageStore, PersistedPage } from ".";

export interface EmbedConcurrencyOptions {
  /**
    Number of pages to chunk and embed concurrently.
   */
  processPages?: number;
  /**  
    Maximum number of chunks per page to generate chunks for concurrently.  
    This includes the creation of the chunk embeddings and any chunk preprocessing.  
   */
  createChunks?: number;
}

/**
  (Re-)embeddedContent the pages in the page store that have changed since the given date
  and stores the embeddedContent in the embeddedContent store.
 */
export const updateEmbeddedContent = async ({
  since,
  embeddedContentStore,
  pageStore,
  sourceNames,
  embedder,
  chunkOptions,
  concurrencyOptions,
}: {
  since: Date;
  embeddedContentStore: EmbeddedContentStore;
  pageStore: PageStore;
  embedder: Embedder;
  chunkOptions?: Partial<ChunkOptions>;
  sourceNames?: string[];
  concurrencyOptions?: EmbedConcurrencyOptions;
}): Promise<void> => {
  const changedPages = await pageStore.loadPages({
    updated: since,
    sources: sourceNames,
  });
  logger.info(
    `Found ${changedPages.length} changed pages since ${since}${
      sourceNames ? ` in sources: ${sourceNames.join(", ")}` : ""
    }`
  );
  await PromisePool.withConcurrency(concurrencyOptions?.processPages ?? 1)
    .for(changedPages)
    .process(async (page) => {
      switch (page.action) {
        case "deleted":
          logger.info(
            `Deleting embedded content for ${page.sourceName}: ${page.url}`
          );
          await embeddedContentStore.deleteEmbeddedContent({
            page,
          });
          break;
        case "created": // fallthrough
        case "updated":
          await updateEmbeddedContentForPage({
            store: embeddedContentStore,
            page,
            chunkOptions,
            embedder,
            concurrencyOptions,
          });
      }
    });
};

const chunkAlgoHashes = new Map<string, string>();

const getHashForFunc = (f: ChunkFunc, o?: Partial<ChunkOptions>): string => {
  const data = JSON.stringify(o ?? {}) + f.toString();
  const existingHash = chunkAlgoHashes.get(data);
  if (existingHash) {
    return existingHash;
  }
  const hash = createHash("sha256");
  hash.update(data);
  const digest = hash.digest("hex");
  chunkAlgoHashes.set(data, digest);
  return digest;
};

export const updateEmbeddedContentForPage = async ({
  page,
  store,
  embedder,
  chunkOptions,
  concurrencyOptions,
}: {
  page: PersistedPage;
  store: EmbeddedContentStore;
  embedder: Embedder;
  chunkOptions?: Partial<ChunkOptions>;
  concurrencyOptions?: EmbedConcurrencyOptions;
}): Promise<void> => {
  const contentChunks = await chunkPage(page, chunkOptions);

  if (contentChunks.length === 0) {
    // This could happen if source returned a page with no content
    logger.warn(
      `No content for page ${page.sourceName}:${page.url} - deleting any existing content and continuing`
    );
    await store.deleteEmbeddedContent({ page });
    return;
  }

  // In order to resume where we left off (in case of script restart), compare
  // the date of any existing chunks with the page updated date. If the chunks
  // have been updated since the page was updated (and we have the expected
  // number of chunks) and chunkAlgoHash has not changed from what's in the
  // database, assume the embedded content for that page is complete and
  // up-to-date. To force an update, you can delete the chunks from the
  // collection.
  const existingContent = await store.loadEmbeddedContent({
    page,
  });
  const chunkAlgoHash = getHashForFunc(chunkPage, chunkOptions);
  if (
    existingContent.length &&
    existingContent[0].updated > page.updated &&
    contentChunks.length === existingContent.length &&
    existingContent[0].chunkAlgoHash === chunkAlgoHash
  ) {
    logger.info(
      `Embedded content for ${page.sourceName}:${page.url} already updated (${existingContent[0].updated}) since page update date (${page.updated}). Skipping embedding.`
    );
    return;
  }

  logger.info(
    `${
      page.action === "created" ? "Creating" : "Updating"
    } embedded content for ${page.sourceName}:${page.url}`
  );

  const { results: embeddedContent } = await PromisePool.withConcurrency(
    concurrencyOptions?.createChunks ?? 1
  )
    .for(contentChunks)
    .process(async (chunk, index) => {
      logger.info(
        `Vectorizing chunk ${index + 1}/${contentChunks.length} for ${
          page.sourceName
        }: ${page.url}`
      );
      const { embedding } = await embedder.embed({
        text: chunk.text,
      });
      return {
        ...chunk,
        embeddings: {
          [store.metadata.embeddingName]: embedding,
        },
        updated: new Date(),
        chunkAlgoHash,
      };
    });

  await store.updateEmbeddedContent({
    page,
    embeddedContent,
  });
};
