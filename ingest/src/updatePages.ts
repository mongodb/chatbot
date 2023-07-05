import { Page, PageStore } from "chat-core";
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
  await Promise.all(
    sources.map(async (source) => {
      const pages = await source.fetchPages();
      await persistPages({
        pages,
        store: pageStore,
        sourceName: source.name,
      });
    })
  );
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
  const changedPages = await getChangedPages({
    oldPages: await store.loadPages({ sourceName }),
    newPages: pages,
  });

  await store.updatePages(changedPages);
};
