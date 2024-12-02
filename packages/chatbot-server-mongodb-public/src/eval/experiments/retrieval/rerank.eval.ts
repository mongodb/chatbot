import "dotenv/config";
import {
  CORE_ENV_VARS,
  makeMongoDbEmbeddedContentStore,
  assertEnvVars,
  FindContentFunc,
  Message,
  updateFrontMatter,
  makeDefaultFindContent,
} from "mongodb-rag-core";
import {
  retrievalConfig,
  embedder,
  preprocessorOpenAiClient,
} from "../../../config";
import { extractMongoDbMetadataFromUserMessage } from "../../../processors/extractMongoDbMetadataFromUserMessage";
import {
  getConversationRetrievalEvalData,
  RetrievalEvalTask,
  runRetrievalEval,
} from "../../evaluationSuites/retrieval";
import { makeStepBackUserQuery } from "../../../processors/makeStepBackUserQuery";
import { OpenAI } from "mongodb-rag-core/openai";
import { CohereClientV2 } from "cohere-ai";
import { getPath } from "./evalCasePath";

const cohereClient = new CohereClientV2({
  token: process.env.COHERE_API_KEY!,
});

const {
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE_NAME,
  OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
  FTS_INDEX_NAME,
} = assertEnvVars(CORE_ENV_VARS);

const embeddedContentStore = makeMongoDbEmbeddedContentStore({
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
  searchIndex: {
    embeddingName: OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
    fullText: {
      name: FTS_INDEX_NAME,
    },
  },
});

// Uses same K in evals as in retrieval config.
// This is because we always return all results to the user in the chatbot.
// If we were to use the retrieval system in a different context where
// we only return the top results of a larger query,
// we could readdress this.
// const { k } = retrievalConfig.findNearestNeighborsOptions;
const k = 5;
const findContent = makeDefaultFindContent({
  embedder,
  store: embeddedContentStore,
  findNearestNeighborsOptions: {
    k: retrievalConfig.findNearestNeighborsOptions.k * 3,
    numCandidates: retrievalConfig.findNearestNeighborsOptions.k * 30,
  },
});

const rerankModel = "rerank-english-v3.0";

const retrieveRelevantContentEvalTask: RetrievalEvalTask = async function (
  data
) {
  const results = await retrieveRelevantContent({
    userMessageText: data.query,
    model: retrievalConfig.preprocessorLlm,
    openAiClient: preprocessorOpenAiClient,
    findContent: findContent,
  });

  const rerankedResults = await cohereClient.rerank({
    query: results.searchQuery,
    documents: results.content.map((c) => ({
      text: `url: ${c.url}\n` + c.text,
    })),
    model: rerankModel,
  });
  // console.log(rerankedResults);
  const rerankedEmbeddedContent = rerankedResults.results
    .slice(0, k)
    .map((r) => {
      const content = results.content[r.index];
      content.score = r.relevanceScore;
      return content;
    });

  return {
    results: rerankedEmbeddedContent.map((c) => ({
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

  return {
    content,
    queryEmbedding,
    transformedUserQuery,
    searchQuery: vectorSearchQuery,
    metadataForQuery,
  };
}

runRetrievalEval({
  experimentName: `mongodb-chatbot-retrieval-rerank?rerankModel=${rerankModel}&minScore=${retrievalConfig.findNearestNeighborsOptions.minScore}`,
  data: () => getConversationRetrievalEvalData(getPath()),
  metadata: {
    description: "Evaluates quality of chatbot retrieval system.",
    retrievalConfig: retrievalConfig,
  },
  task: retrieveRelevantContentEvalTask,
  k,
});
