import { PageFormat } from "./PageFormat";

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

  /**
    The file format of the page. This format determines how the page
    should be chunked and vector-embedded.
   */
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

export type LoadPagesArgs<QueryShape = unknown> = {
  /**
    A custom query to refine the pages to load.
   */
  query?: QueryShape;

  /**
   The names of the sources to load pages from. If undefined, loads available
   pages from all sources.
  */
  sources?: string[];

  /**
   If specified, refines the query to load pages with an updated date later
   or equal to the given date.
  */
  updated?: Date;

  /**
   If specified, refines the query to only load pages where the url
   is included in the list.
  */
  urls?: string[];
};

export interface DataSourceOverview {
  name: string;
  description?: string;
  lastUpdated: number;
  metadata?: Record<string, unknown>;
}

/**
  Data store for {@link Page} objects.
 */
export type PageStore = {
  /**
    The format that the store uses for custom queries. If not specified,
    the store does not allow custom queries.
   */
  queryType?: "mongodb" | string;

  /**
    Loads pages from the Page store.
   */
  loadPages(args?: LoadPagesArgs): Promise<PersistedPage[]>;

  /**
    Updates or adds the given pages in the store.
   */
  updatePages(pages: PersistedPage[]): Promise<void>;

  /**
    List metadata about the data sources in the store.
   */
  listDataSources(sourceNames?: string[]): Promise<DataSourceOverview[]>;

  /**
    Close connection to data store.
   */
  close?: () => Promise<void>;
};
