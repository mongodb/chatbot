import { Filter } from "mongodb";

/**
  Represents a page from a data source.
 */
export type Page = {
  url: string;

  /**
    A human-readable title.
   */
  title?: string;

  /**
    The text of the page.
   */
  body: string;

  format: PageFormat;

  /**
    Data source name.
   */
  sourceName: string;

  /**
    Arbitrary metadata for page.
   */
  metadata?: PageMetadata;
};

export type PageMetadata = {
  /**
    Arbitrary tags.
   */
  tags?: string[];
  [k: string]: unknown;
};

export type PageFormat = "md" | "txt" | "openapi-yaml";

export type PageAction = "created" | "updated" | "deleted";

/**
  Represents a {@link Page} stored in the database.
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

export type LoadPagesQuery = {
  /**
    A MongoDB query to refine the pages to load.
   */
  query: Filter<PersistedPage>;
};

export type LoadPagesArgs = {
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
};

/**
  Data store for {@link Page} objects.
 */
export type PageStore = {
  /**
    Loads pages from the Page store.
   */
  loadPages(args?: LoadPagesQuery | LoadPagesArgs): Promise<PersistedPage[]>;

  /**
    Updates or adds the given pages in the store.
   */
  updatePages(pages: PersistedPage[]): Promise<void>;

  /**
    Close connection to data store.
   */
  close?: () => Promise<void>;
};
