export interface SearchResult<
  T extends Record<string, unknown> | undefined = undefined
> {
  title?: string;
  url: string;
  text?: string;
  customData?: T;
}

export interface SearchParams {
  query: string;
  limit: number;
  offset: number;
}
export type SearchFunc = (params: SearchParams) => Promise<SearchResult[]>;
