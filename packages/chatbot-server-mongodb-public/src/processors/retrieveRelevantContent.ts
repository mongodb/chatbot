import { makeStepBackUserQuery } from "./makeStepBackUserQuery";
import { FindContentFunc, Message } from "mongodb-rag-core";
import { updateFrontMatter } from "mongodb-rag-core";
import { OpenAI } from "mongodb-rag-core/openai";
import { searchMongoDbDocs } from "./searchMongoDbDocs";
import { augmentSearchWithRrf } from "./augmentSearchWithDocsRrf";

export const retrieveRelevantContent = async function ({
  openAiClient,
  model,
  precedingMessagesToInclude,
  userMessageText,
  metadataForQuery,
  findContent,
  k = 5,
}: {
  openAiClient: OpenAI;
  model: string;
  precedingMessagesToInclude?: Message[];
  userMessageText: string;
  metadataForQuery?: Record<string, unknown>;
  findContent: FindContentFunc;
  k?: number;
}) {
  const { transformedUserQuery } = await makeStepBackUserQuery({
    openAiClient,
    model,
    messages: precedingMessagesToInclude,
    userMessageText: metadataForQuery
      ? updateFrontMatter(userMessageText, metadataForQuery)
      : userMessageText,
  });

  const searchQuery = metadataForQuery
    ? updateFrontMatter(transformedUserQuery, metadataForQuery)
    : transformedUserQuery;

  // Parallelize execution of the two search functions.
  const [vsResults, { results: ftsResults }] = await Promise.all([
    findContent({
      query: searchQuery,
    }),
    (async () => {
      // Use raw user input if no preceding messages.
      // Otherwise use transformed query to contextualize query in the conversation.
      const ftsQuery =
        precedingMessagesToInclude?.length === 0
          ? userMessageText
          : transformedUserQuery;
      return searchMongoDbDocs(ftsQuery, 5);
    })(),
  ]);

  const content = augmentSearchWithRrf({
    primaryResultSet: {
      content: vsResults.content,
      weight: 0.6,
    },
    secondaryResultSet: {
      content: ftsResults,
      weight: 0.4,
    },
    k,
  });

  return {
    content,
    queryEmbedding: vsResults.queryEmbedding,
    transformedUserQuery,
    searchQuery,
  };
};
