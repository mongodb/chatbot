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

const getHashForFunc = (
  f: ChunkFunc,
  o?: Partial<ChunkOptions>
): string => {
  const data = JSON.stringify(o ?? {}) + f.toString();
  const hash = createHash("sha256");
  hash.update(data);
  const digest = hash.digest("hex");
  return digest;
};

/**
 Updates embedded content for pages that have changed since a given date or have different chunking hashes.
 
 @param options - The configuration options for updating embedded content
 @param options.since - The date from which to check for content changes
 @param options.embeddedContentStore - The store containing embedded content
 @param options.pageStore - The store containing pages
 @param options.sourceNames - Optional array of source names to filter pages by
 @param options.embedder - The embedder instance used to generate embeddings
 @param options.chunkOptions - Optional configuration for chunking algorithm
 @param options.concurrencyOptions - Optional configuration for controlling concurrency during embedding
 
 @remarks
 The function performs the following steps:
 1. Finds pages with content changes since the specified date
 2. Identifies pages with different chunking hashes from the current algorithm
 3. Processes both sets of pages by either:
 - Deleting embedded content for deleted pages
 - Updating embedded content for created/updated pages
 
 Processing is done with configurable concurrency to manage system resources.
 
 @throws Will throw an error if there are issues accessing stores or processing pages
 
 @returns Promise that resolves when all updates are complete
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
  // find all pages with changed content
  const pagesWithChangedContent = await pageStore.loadPages({
    updated: since,
    sources: sourceNames,
  });
  logger.info(
    `Found ${pagesWithChangedContent.length} changed pages since ${since}${
      sourceNames ? ` in sources: ${sourceNames.join(", ")}` : ""
    }`
  );
  // find all pages with embeddings created using chunkingHashes different from the current chunkingHash
  const chunkAlgoHash = getHashForFunc(
    chunkPage,
    chunkOptions
  );
  const dataSourcesWithChangedChunking =
    await embeddedContentStore.getDataSources({
      chunkAlgoHash: {
        hashValue: chunkAlgoHash,
        operation: "notEquals",
      },
      sourceNames,
    });
  // find all pages with changed chunking, ignoring since date because
  // we want to re-chunk all pages with the new chunkAlgoHash, even if there were no other changes to the page
  const pagesWithChangedChunking = await pageStore.loadPages({
    sources: dataSourcesWithChangedChunking,
  });
  logger.info(
    `Found ${
      pagesWithChangedChunking.length
    } pages with changed chunkingHashes ${
      sourceNames ? ` in sources: ${sourceNames.join(", ")}` : ""
    }`
  );
  const changedPages = [
    ...pagesWithChangedContent,
    ...pagesWithChangedChunking,
  ];
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
            chunkAlgoHash,
          });
      }
    });
};

export const updateEmbeddedContentForPage = async ({
  page,
  store,
  embedder,
  chunkOptions,
  concurrencyOptions,
  chunkAlgoHash,
}: {
  page: PersistedPage;
  store: EmbeddedContentStore;
  embedder: Embedder;
  chunkOptions?: Partial<ChunkOptions>;
  concurrencyOptions?: EmbedConcurrencyOptions;
  chunkAlgoHash: string;
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
        sourceType: page.sourceType,
      };
    });

  await store.updateEmbeddedContent({
    page,
    embeddedContent,
  });
};
