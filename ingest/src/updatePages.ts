import deepEqual from "deep-equal";

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

export type DataSource = {
  name: string;

  fetchPages(): Promise<Page[]>;
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
  const changedPages = await findChangedPages({
    oldPages: await store.loadPages({ sourceName }),
    newPages: pages,
  });

  await store.updatePages(changedPages);
};

export const findChangedPages = async ({
  oldPages: oldPagesIn,
  newPages: newPagesIn,
}: {
  oldPages: Page[];
  newPages: Page[];
}): Promise<PersistedPage[]> => {
  const oldPages = new Map(oldPagesIn.map((page) => [page.url, page]));
  const newPages = new Map(newPagesIn.map((page) => [page.url, page]));

  const deletedPages = [...oldPages]
    .filter(([url]) => !newPages.has(url))
    .map(
      ([, page]): PersistedPage => ({
        ...page,
        updated: new Date(),
        action: "deleted",
      })
    );

  const createdPages = [...newPages]
    .filter(([url]) => !oldPages.has(url))
    .map(
      ([, page]): PersistedPage => ({
        ...page,
        updated: new Date(),
        action: "created",
      })
    );

  const updatedPages = [...newPages]
    .filter(([url, page]) => {
      const oldPage = oldPages.get(url);
      if (!oldPage) {
        return false;
      }
      // Filter out pages that haven't changed
      return !deepEqual(
        comparablePartialPage(oldPage),
        comparablePartialPage(page)
      );
    })
    .map(
      ([, page]): PersistedPage => ({
        ...page,
        updated: new Date(),
        action: "updated",
      })
    );

  return [...createdPages, ...deletedPages, ...updatedPages];
};

const comparablePartialPage = ({
  url,
  sourceName,
  body,
  format,
  tags,
}: Page): Partial<Page> => ({
  url,
  sourceName,
  body,
  format,
  tags,
});
