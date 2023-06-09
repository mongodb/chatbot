/**
  Fetches pages from data sources and stores those that have changed in the data
  store.
 */
export const updatePages = async (args: {
  sources: DataSource[];
  pageStore: PageStore;
}): Promise<void> => {
  const pages = await fetchPages(args);
  await persistPages({
    pages,
    store: args.pageStore,
  });
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
  source: string;

  tags: string[];
};

/**
  Represents a page stored in the database.
 */
export type PersistedPage = Page & {
  /**
    Last updated.
   */
  updated: Date;

  action: "created" | "updated" | "deleted";
};

export type DataSource = {
  name: string;

  fetchPages(): Promise<Page[]>;
};

// TODO: This is a stand-in for Atlas
export type PageStore = {
  loadPages(): Promise<PersistedPage[]>;
  updatePages(pages: PersistedPage[]): Promise<void>;
};

/**
  Fetch pages from given data sources.
 */
export const fetchPages = async (args: {
  sources: DataSource[];
}): Promise<Page[]> => {
  // TODO: Fetch data from sources
  return [];
};

/**
  Persists pages that have changed.
 */
export const persistPages = async (args: {
  store: PageStore;
  pages: Page[];
}): Promise<void> => {
  // TODO: Persist pages that have changed
};
