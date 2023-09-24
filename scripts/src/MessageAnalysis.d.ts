/** 
  Analyze the given user query into the following data type.
 */
export interface MessageAnalysis {
  /**
    Extract the topic keywords of the user query. Keep topics as general as
    possible. Do not include anything that looks like personally-identifiable
    information.

    @example ["MongoDB Atlas", "Aggregation Framework", "how to"]
   */
  topics: string[];

  /**
    In as few words as possible, characterize the sentiment of the given user query.

    @example "Informational/Technical"
  */
  sentiment: string;

  /**
    If the given query contains anything resembling personally-identifiable
    information (PII), set this flag to true. Otherwise, set it to false.
  */
  piiDetected: boolean;
}
