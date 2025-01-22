/**
  The list of canonical file formats that we support for pages.
 */
export declare const pageFormats: (
  | "txt"
  | "md"
  | "mdx"
  | "restructuredtext"
  | "csv"
  | "json"
  | "yaml"
  | "toml"
  | "xml"
  | "openapi-yaml"
  | "openapi-json"
  | "graphql"
  | "c"
  | "cpp"
  | "csharp"
  | "go"
  | "html"
  | "java"
  | "javascript"
  | "kotlin"
  | "latex"
  | "objective-c"
  | "php"
  | "python"
  | "ruby"
  | "rust"
  | "scala"
  | "shell"
  | "swift"
  | "typescript"
)[];
/**
    Maps a string to the canonical page format it represents.

    @returns The canonical page format, or undefined if the string is not
    a recognized page format.
   */
export declare const asPageFormat: (str: string) => PageFormat | undefined;
/**
    A canonical page format.
   */
export type PageFormat = (typeof pageFormats)[number];
/**
    Type guard to check if a string is a canonical page format.
   */
export declare function isPageFormat(str: string): str is PageFormat;
/**
    Converts a string to a canonical page format. If the string is not a
    recognized page format or a synonym for one, this returns a default
    page format.
   */
export declare function pageFormat(
  str: string,
  defaultPageFormat?: PageFormat
): PageFormat;
//# sourceMappingURL=PageFormat.d.ts.map
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
