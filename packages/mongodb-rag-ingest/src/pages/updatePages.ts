import { logger, Page, PageStore } from "mongodb-rag-core";
import { getChangedPages } from "./getChangedPages";
import { DataSource } from "../sources/DataSource";
import { PromisePool } from "@supercharge/promise-pool";
import { ConcurrencyOptions } from "../Config";
/**
  Fetches pages from data sources and stores those that have changed in the data
  store.
 */
export const updatePages = async ({
  sources,
  pageStore,
  concurrencyOptions,
}: {
  sources: DataSource[];
  pageStore: PageStore;
  concurrencyOptions: ConcurrencyOptions
}): Promise<void> => {
  await PromisePool
    .withConcurrency(concurrencyOptions.embed.processPages)
    .for(sources)
    .process(async (source, index, pool) => {
      logger.info(`Fetching pages for ${source.name}`);
      const pages = await source.fetchPages();
      logger.info(`${source.name} returned ${pages.length} pages`);
      if (pages.length === 0) {
        // If a flaky data source returns no pages, we would mark all pages in
        // that source as deleted. This is probably not wanted.
        logger.warn(
          `Expected at least 1 page from ${source.name}. Discarding result.`
        );
      }
      await persistPages({
        pages,
        store: pageStore,
        sourceName: source.name,
      });
    })
};

/**
  Persists pages that have changed.
 */
export const persistPages = async ({
  store,
  pages,
  sourceName,
}: {
  store: PageStore;
  pages: Page[];
  sourceName: string;
}): Promise<void> => {
  const oldPages = await store.loadPages({ sources: [sourceName] });
  logger.info(`${sourceName} had ${oldPages.length} in the store`);

  const { created, updated, deleted } = await getChangedPages({
    oldPages,
    newPages: pages,
  });

  logger.info(
    `${deleted.length} deleted / ${created.length} created / ${updated.length} updated`
  );
  await store.updatePages([...deleted, ...created, ...updated]);
};
