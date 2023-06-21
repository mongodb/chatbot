import { getChangedPages } from "./getChangedPages.js";
import { DataSource } from "./DataSource.js";

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
  Represents a page from a data source.
 */
export type Page = {
  url: string;
  body: string;
  format: "md" | "txt";

  /**
    Data source name.
   */
  sourceName: string;

  tags: string[];
};

export type PageAction = "created" | "updated" | "deleted";

/**
  Represents a page stored in the database.
 */
export type PersistedPage = Page & {
  /**
    Last updated.
   */
  updated: Date;

  action: PageAction;
};

export type PageStore = {
  loadPages(args: { sourceName: string }): Promise<PersistedPage[]>;
  updatePages(pages: PersistedPage[]): Promise<void>;
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
