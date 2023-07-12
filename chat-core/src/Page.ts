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

  /**
    Arbitrary tags.
   */
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

  /**
    The action upon last update.
   */
  action: PageAction;
};

export type PageStore = {
  loadPages(args?: {
    /**
      If specified, refines the query to load pages with an updated date later
      or equal to the given date.
     */
    updated?: Date;

    /**
      The names of the sources to load pages from. If undefined, loads available
      pages from all sources.
     */
    sources?: string[];
  }): Promise<PersistedPage[]>;

  updatePages(pages: PersistedPage[]): Promise<void>;
};
