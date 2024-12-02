import "dotenv/config";
import {
  FindContentFunc,
  makeDefaultFindContent,
  Message,
  updateFrontMatter,
} from "mongodb-rag-core";
import {
  retrievalConfig,
  preprocessorOpenAiClient,
  embedder,
  embeddedContentStore,
} from "../../../config";
import { extractMongoDbMetadataFromUserMessage } from "../../../processors/extractMongoDbMetadataFromUserMessage";
import {
  getConversationRetrievalEvalData,
  RetrievalEvalTask,
  runRetrievalEval,
} from "../../evaluationSuites/retrieval";
import { makeStepBackUserQuery } from "../../../processors/makeStepBackUserQuery";
import { OpenAI } from "mongodb-rag-core/openai";
import { getPath } from "./evalCasePath";
import { searchMongoDbDocs } from "../../../processors/searchMongoDbDocs";
import { augmentSearchWithDocsRrf } from "../../../processors/augmentSearchWithDocsRrf";

// Uses same K in evals as in retrieval config.
// This is because we always return all results to the user in the chatbot.
// If we were to use the retrieval system in a different context where
// we only return the top results of a larger query,
// we could readdress this.
const { k } = retrievalConfig.findNearestNeighborsOptions;

const hybridConfig = {
  vsWeight: 0.5,
  ftsWeight: 0.5,
};

const findContent = makeDefaultFindContent({
  embedder,
  store: embeddedContentStore,
  findNearestNeighborsOptions: {
    ...retrievalConfig.findNearestNeighborsOptions,
    k: retrievalConfig.findNearestNeighborsOptions.k * 10,
    numCandidates: retrievalConfig.findNearestNeighborsOptions.k * 50,
  },
});
const retrieveRelevantContentEvalTask: RetrievalEvalTask = async function (
  data
) {
  const results = await retrieveRelevantContent({
    userMessageText: data.query,
    model: retrievalConfig.preprocessorLlm,
    openAiClient: preprocessorOpenAiClient,
    findContent: findContent,
  });

  return {
    results: results.content.map((c) => ({
      url: c.url,
      content: c.text,
      score: c.score,
    })),
    extractedMetadata: results.metadataForQuery,
    rewrittenQuery: results.transformedUserQuery,
    searchString: results.searchQuery,
  };
};

async function retrieveRelevantContent({
  openAiClient,
  model,
  precedingMessagesToInclude,
  userMessageText,
}: {
  openAiClient: OpenAI;
  model: string;
  precedingMessagesToInclude?: Message[];
  userMessageText: string;
  findContent: FindContentFunc;
}) {
  const metadataForQuery = await extractMongoDbMetadataFromUserMessage({
    openAiClient: preprocessorOpenAiClient,
    model: retrievalConfig.preprocessorLlm,
    userMessageText,
  });
  const { transformedUserQuery } = await makeStepBackUserQuery({
    openAiClient,
    model,
    messages: precedingMessagesToInclude,
    userMessageText: metadataForQuery
      ? updateFrontMatter(userMessageText, metadataForQuery)
      : userMessageText,
  });

  const vectorSearchQuery = metadataForQuery
    ? updateFrontMatter(transformedUserQuery, metadataForQuery)
    : transformedUserQuery;

  const { content, queryEmbedding } = await findContent({
    query: vectorSearchQuery,
  });
  const mongodbResults = await searchMongoDbDocs(userMessageText);
  const augmentedResults = await augmentSearchWithDocsRrf({
    searchResults: {
      content,
      weight: hybridConfig.vsWeight,
    },
    docsSearchResults: {
      content: mongodbResults.results,
      weight: hybridConfig.ftsWeight,
    },
    k,
  });
  return {
    content: augmentedResults,
    queryEmbedding,
    transformedUserQuery,
    searchQuery: vectorSearchQuery,
    metadataForQuery,
  };
}

runRetrievalEval({
  experimentName: `mongodb-chatbot-retrieval-hybrid-docs?vsWeight=${hybridConfig.vsWeight}&ftsWeight=${hybridConfig.ftsWeight}&model=${retrievalConfig.embeddingModel}&@K=${k}&minScore=${retrievalConfig.findNearestNeighborsOptions.minScore}`,
  metadata: {
    description: "Evaluates quality of chatbot retrieval system.",
    retrievalConfig: hybridConfig,
  },
  data: () => getConversationRetrievalEvalData(getPath()),
  task: retrieveRelevantContentEvalTask,
  maxConcurrency: 15,
  k,
});
