import { getChangedPages } from "./getChangedPages";
import { DataSource } from "../sources/DataSource";
import { PageStore, Page } from "../../Page";
import { logger } from "../../logger";

/**
  Fetches pages from data sources and stores those that have changed in the data
  store.
 */
export const updatePages = async ({
  sources,
  pageStore,
}: {
  sources: DataSource[];
  pageStore: PageStore;
}): Promise<void> => {
  for await (const source of sources) {
    logger.info(`Fetching pages for ${source.name}`);
    const pages = await source.fetchPages();
    logger.info(`${source.name} returned ${pages.length} pages`);
    if (pages.length === 0) {
      // If a flaky data source returns no pages, we would mark all pages in
      // that source as deleted. This is probably not wanted.
      logger.warn(
        `Expected at least 1 page from ${source.name}. Discarding result.`
      );
      continue;
    }
    await persistPages({
      pages,
      store: pageStore,
      sourceName: source.name,
    });
  }
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
