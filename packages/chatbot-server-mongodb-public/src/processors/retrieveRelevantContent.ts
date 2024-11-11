import { makeStepBackUserQuery } from "./makeStepBackUserQuery";
import { FindContentFunc, Message } from "mongodb-rag-core";
import { updateFrontMatter } from "mongodb-rag-core";
import { OpenAI } from "mongodb-rag-core/openai";

export const retrieveRelevantContent = async function ({
  openAiClient,
  model,
  precedingMessagesToInclude,
  userMessageText,
  metadataForQuery,
  findContent,
}: {
  openAiClient: OpenAI;
  model: string;
  precedingMessagesToInclude?: Message[];
  userMessageText: string;
  metadataForQuery?: Record<string, unknown>;
  findContent: FindContentFunc;
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

  const { content, queryEmbedding } = await findContent({
    query: searchQuery,
  });

  return { content, queryEmbedding, transformedUserQuery, searchQuery };
};
