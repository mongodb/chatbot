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

export interface SearchReturnValue {
  results: SearchResult[];
  rejectQuery?: boolean;
}
export type SearchFunc = (params: SearchParams) => Promise<SearchReturnValue>;
