export interface QueryPreprocessorMessage {
  content: string;
  role: string;
}
/** Query preprocessors run on the raw user input. They must return a new query.
  They can also optionally return additional data.
*/
export type QueryPreprocessorFunc<T> = ({
  query,
  messages,
}: {
  query: string;
  messages: { content: string; role: string }[];
}) => Promise<T & { query: string }>;
