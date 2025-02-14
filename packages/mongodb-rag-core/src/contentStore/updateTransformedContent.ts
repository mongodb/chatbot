import { createHash } from "crypto";
import { PromisePool } from "@supercharge/promise-pool";
import { logger } from "../logger";
import { PageStore, PersistedPage } from ".";
import {
  TransformedContent,
  TransformedContentStore,
} from "./TransformedContent";

export interface TransformConcurrencyOptions {
  /**
    Number of pages to transform concurrently.
   */
  processPages?: number;
}

export type TransformPage<T extends Omit<TransformedContent, "chunkAlgoHash">> =
  (page: PersistedPage) => Promise<T[]>;

/**
  (Re-)transform content the pages in the page store that have changed since the given date
  and stores the transformedContent in the transformedContent store.
 */
export async function updateTransformedContent<TC extends TransformedContent>({
  since,
  transformedContentStore,
  pageStore,
  sourceNames,
  transformPage,
  concurrencyOptions,
}: {
  since: Date;
  transformedContentStore: TransformedContentStore<TC>;
  pageStore: PageStore;
  transformPage: TransformPage<TC>;
  sourceNames?: string[];
  concurrencyOptions?: TransformConcurrencyOptions;
}): Promise<void> {
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
          await transformedContentStore.deleteContent({
            page,
          });
          break;
        case "created": // fallthrough
        case "updated":
          await updateTranformedContentForPage({
            store: transformedContentStore,
            page,
            transformPage,
          });
      }
    });
}

const chunkAlgoHashes = new Map<string, string>();

const getHashForFunc = (f: { toString(): string }): string => {
  const data = f.toString();
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

export async function updateTranformedContentForPage<
  TC extends TransformedContent
>({
  page,
  store,
  transformPage,
}: {
  page: PersistedPage;
  store: TransformedContentStore<TC>;
  transformPage: TransformPage<TC>;
}): Promise<void> {
  const contentChunks = await transformPage(page);

  if (contentChunks.length === 0) {
    // This could happen if source returned a page with no content
    logger.warn(
      `No content for page ${page.sourceName}:${page.url} - deleting any existing content and continuing`
    );
    await store.deleteContent({ page });
    return;
  }

  // In order to resume where we left off (in case of script restart), compare
  // the date of any existing transformed content with the page updated date. If the content
  // has been updated since the page was updated (and we have the expected
  // number of transformed contents) and transformAlgoHash has not changed from what's in the
  // database, assume the tranformed content for that page is complete and
  // up-to-date. To force an update, you can delete the transformedContent from the
  // collection.
  const existingContent = await store.loadContent({
    page,
  });
  const chunkAlgoHash = getHashForFunc(transformPage);
  if (
    existingContent.length &&
    existingContent[0].updated > page.updated &&
    contentChunks.length === existingContent.length &&
    existingContent[0].transformAlgoHash === chunkAlgoHash
  ) {
    logger.info(
      `Transformed content for ${page.sourceName}:${page.url} already updated (${existingContent[0].updated}) since page update date (${page.updated}). Skipping embedding.`
    );
    return;
  }

  logger.info(
    `${
      page.action === "created" ? "Creating" : "Updating"
    } transformed content for ${page.sourceName}:${page.url}`
  );

  const transformedContent = contentChunks.map((chunk) => ({
    ...chunk,
    updated: new Date(),
    chunkAlgoHash,
  }));

  await store.updateContent({
    page,
    transformedContent,
  });
}
