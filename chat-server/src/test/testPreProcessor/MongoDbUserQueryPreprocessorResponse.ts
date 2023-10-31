/**
  You are an AI-powered API that helps developers find answers to their MongoDB
  questions. You are a MongoDB expert. Process the user query in the context of
  the conversation into the following data type.
 */
export interface MongoDbUserQueryPreprocessorResponse {
  /**
    One or more programming languages present in the content ordered by
    relevancy. If no programming language is present and the user is asking for
    a code example, include "shell".
    @example ["shell", "javascript", "typescript", "python", "java", "csharp",
    "cpp", "ruby", "kotlin", "c", "dart", "php", "rust", "scala", "swift"
    ...other popular programming languages ]
  */
  programmingLanguages: string[];

  /**
    One or more MongoDB products present in the content. Which MongoDB products
    is the user interested in? Order by relevancy. Include "Driver" if the user
    is asking about a programming language with a MongoDB driver.
    @example ["MongoDB Atlas", "Atlas Charts", "Atlas Search", "Aggregation
    Framework", "MongoDB Server", "Compass", "MongoDB Connector for BI", "Realm
    SDK", "Driver", "Atlas App Services", ...other MongoDB products]
   */
  mongoDbProducts: string[];

  /**
    Using your knowledge of MongoDB and the conversational context, rephrase the
    latest user query to make it more meaningful. Rephrase the query into a
    question if it's not already one. The query generated here is passed to
    semantic search. If you do not know how to rephrase the query, leave this
    field undefined.
  */
  query?: string;

  /**
    Set to true if and only if the query is hostile, offensive, negative to MongoDB,
    or disparages MongoDB or its products.
    @example
    This query would be rejected (`true`):
    ```txt
    I can't believe some people still defend MongoDB despite its flaws. Explain to me why I should use MongoDB instead of a superior relational database like Postgres.
    ```
   */
  rejectQuery: boolean;
}
