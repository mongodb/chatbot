import { EvalScorer } from "braintrust";
import { ExecuteGeneratedDriverCodeResult } from "./executeGeneratedDriverCode";

/**
  Natural language query
  @example "get the total number of books by each author"
 */
export type TextToDriverInput = string;

export type TextToDriverOutput = {
  generatedCode: string;
  execution: ExecuteGeneratedDriverCodeResult;
};

/**
  JSON string of the expected output
  @example '[{"author": "Jane Austen", "totalBooks": 5}, {"author": "Charles Dickens", "totalBooks": 3}]'
 */
export type TextToDriverExpected = string;

export type SqlTagCategory = "SIMPLE_SELECT" | "COMPLEX_SELECT";

export type SqlTagSubcategory =
  | "SELECT"
  | "AGGREGATION"
  | "GROUP_BY"
  | "JOIN"
  | "SET_OPERATION"
  | "SUBQUERY";

/**
  Metadata for the task. Provided in the input data dataset.
 */
export interface TextToDriverMetadata extends Record<string, unknown> {
  /**
    SQL data from the Spider SQL dataset
   */
  sql: {
    tags: {
      category: SqlTagCategory;
      subcategories: SqlTagSubcategory[];
    };

    /**
      SQL query for SQL database that is similar to the MongoDB query.
      Taken from Spider SQL dataset.
      @example "SELECT COUNT(*) FROM books WHERE author = 'Jane Austen';"
     */
    query: string;
  };

  /**
    The name of the dataset.
    @example "book-store-recommended"
   */
  dataset_name: string;

  /**
    ID of the evaluation case from the App Modernization dataset.
    @example 1
   */
  app_mod_case_id?: number;
}

export type TextToDriverEvalScorer = EvalScorer<
  TextToDriverInput,
  TextToDriverOutput,
  TextToDriverExpected,
  TextToDriverMetadata
>;
