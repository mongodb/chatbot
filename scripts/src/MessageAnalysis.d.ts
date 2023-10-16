/** 
  Analyze the given user query into the following data type.
 */
export interface MessageAnalysis {
  /**
    Extract the topic keywords of the user query. Keep topics as general as
    possible. Include the genre or type of material that the user might be
    expecting in response to the given query. Do not include anything that looks
    like personally-identifiable information.

    @example ["MongoDB Atlas", "Aggregation Framework", "how to", "troubleshooting"]
   */
  topics: string[];

  /**
    In as few words as possible, characterize the sentiment of the given user query.

    @example "Informational/Technical"
  */
  sentiment?: string;

  /**
    On a scale of 0-1, rate how appropriate it is to ask the given query of a
    chatbot whose expertise is in MongoDB.
  */
  relevance: number;

  /**
    If the given query contains anything resembling personally-identifiable
    information (PII), set this flag to true. Otherwise, set it to false.
  */
  pii: boolean;
}
