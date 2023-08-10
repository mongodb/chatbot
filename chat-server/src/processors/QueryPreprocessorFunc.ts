export interface QueryPreprocessorMessage {
  content: string;
  role: string;
}
/** Query preprocessors run on the raw user input. They must return a new query.
  They can also optionally return additional data.
*/
export type QueryPreprocessorFunc<
  T extends Record<string, unknown> = Record<string, unknown>
> = ({
  query,
  messages,
}: {
  query: string;
  messages: QueryPreprocessorMessage[];
}) => Promise<T & { query: string; doNotAnswer?: boolean }>;
