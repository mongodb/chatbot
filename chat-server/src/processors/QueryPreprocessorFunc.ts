import { Message } from "../services";

/**
  Query preprocessors run on the raw user input. They must return a new query.
  They can also optionally return additional data.
*/
export type QueryPreprocessorFunc<T = unknown> = ({
  query,
  messages,
}: {
  query: string;
  messages: Message[];
}) => Promise<T & { query: string; doNotAnswer?: boolean }>;
