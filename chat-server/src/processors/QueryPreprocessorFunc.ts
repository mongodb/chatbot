export interface QueryPreprocessorMessage {
  content: string;
  role: string;
}

/**
  Query preprocessors transform an input query to a new query based on your
  business logic.

  If the preprocessor can't transform the query, it may return undefined. The
  preprocessor may also suggest not answering with the rejectQuery field in the
  return value (for example, if the query disparages your company, you might
  want to send a canned response).
*/
export type QueryPreprocessorFunc<
  ReturnType extends QueryPreprocessorResult = QueryPreprocessorResult
> = ({
  query,
  messages,
}: {
  query?: string;
  messages: QueryPreprocessorMessage[];
}) => Promise<ReturnType>;

export type QueryPreprocessorResult = {
  query?: string;
  rejectQuery: boolean;
};
