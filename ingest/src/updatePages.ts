import { logger, Page, PageStore } from "chat-core";
import { getChangedPages } from "./getChangedPages";
import { DataSource } from "./DataSource";

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
