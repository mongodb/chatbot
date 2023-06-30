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

  action: PageAction;
};

export type PageStore = {
  loadPages(args?: {
    updated?: Date;
    sourceName?: string;
  }): Promise<PersistedPage[]>;
  updatePages(pages: PersistedPage[]): Promise<void>;
};
