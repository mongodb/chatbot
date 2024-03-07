/**
  Generic vector store for vector-searchable data.
 */
export type VectorStore<T> = {
  /**
    Find nearest neighbors to the given vector.
   */
  findNearestNeighbors(
    vector: number[],
    options?: Partial<FindNearestNeighborsOptions>
  ): Promise<WithScore<T>[]>;

  close?(): Promise<void>;
};

export type WithScore<T> = T & { score: number };

/**
  Options for performing a nearest-neighbor search.
 */
export type FindNearestNeighborsOptions = {
  /**
    The name of the index to use.
   */
  indexName: string;

  /**
    The keypath to the field with the vector data to use.
   */
  path: string;

  /**
    The number of nearest neighbors to return.
   */
  k: number;

  /**
    Number of nearest neighbors to use during the search.
    Value must be less than or equal to 10000.
    You can't specify a number less than the number of documents to return (k).
   */
  numCandidates: number;

  /**
    The minimum nearest-neighbor score threshold between 0-1.
   */
  minScore: number;

  /**
    Search filter expression.
   */
  filter: Record<string, unknown>;
};
