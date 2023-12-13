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

export type LoadPagesQuery<T = unknown> = {
  /**
    A custom query to refine the pages to load.
   */
  query: T;
};

export type LoadPagesArgs = {
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

  /**
   The names of the sources to load pages from. If undefined, loads available
   pages from all sources.
  */
  sources?: string[];
};

/**
  Data store for {@link Page} objects.
 */
export type PageStore<QueryShape = unknown> = {
  /**
    The format that the store uses for custom queries. If not specified,
    the store does not allow custom queries.
   */
  queryType?: "mongodb" | string;

  /**
    Loads pages from the Page store.
   */
  loadPages(args?: LoadPagesQuery<QueryShape> | LoadPagesArgs): Promise<PersistedPage[]>;

  /**
    Updates or adds the given pages in the store.
   */
  updatePages(pages: PersistedPage[]): Promise<void>;

  /**
    Close connection to data store.
   */
  close?: () => Promise<void>;
};

export type ParsedLoadPagesQuery<QueryShape = unknown> = {
  type: "query";
  query: LoadPagesQuery<QueryShape>["query"];
};

export type ParsedLoadPagesArgs = {
  type: "args";
  args: LoadPagesArgs;
};

export type ParsedLoadPagesArgsOrQuery<QueryShape = unknown> =
  | ParsedLoadPagesQuery<QueryShape>
  | ParsedLoadPagesArgs;

export function parseLoadPagesArgs<QueryShape = unknown>(
  args: NonNullable<Parameters<PageStore["loadPages"]>[0]>
): ParsedLoadPagesArgsOrQuery<QueryShape> {
  const query = (args as Partial<LoadPagesQuery<QueryShape>>).query;
  if (query) {
    return { type: "query", query };
  } else {
    return { type: "args", args: args as LoadPagesArgs };
  }
}
