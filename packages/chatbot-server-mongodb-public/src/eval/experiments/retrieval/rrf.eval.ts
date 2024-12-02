import "dotenv/config";
import {
  CORE_ENV_VARS,
  makeMongoDbEmbeddedContentStore,
  makeRrfFindContent,
  assertEnvVars,
  MakeRrfFindContentParams,
  FindContentFunc,
  Message,
  updateFrontMatter,
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
import { getPath } from "./evalCasePath";

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
const { k } = retrievalConfig.findNearestNeighborsOptions;

const rrfFindContentConfig = {
  embedder,
  store: embeddedContentStore,
  config: {
    vectorSearch: {
      weight: 0.85,
      options: {
        ...retrievalConfig.findNearestNeighborsOptions,
        k: retrievalConfig.findNearestNeighborsOptions.k * 10,
        numCandidates: retrievalConfig.findNearestNeighborsOptions.k * 50,
      },
    },
    fts: {
      indexName: FTS_INDEX_NAME,
      weight: 0.15,
      limit: retrievalConfig.findNearestNeighborsOptions.k * 20,
      // additionalQueryElements: {},
    },
    limit: retrievalConfig.findNearestNeighborsOptions.k,
  },
} satisfies MakeRrfFindContentParams;
const rrfFindContent = makeRrfFindContent(rrfFindContentConfig);

const retrieveRelevantContentEvalTask: RetrievalEvalTask = async function (
  data
) {
  const results = await retrieveRelevantContent({
    userMessageText: data.query,
    model: retrievalConfig.preprocessorLlm,
    openAiClient: preprocessorOpenAiClient,
    findContent: rrfFindContent,
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

  const { content, queryEmbedding } = await rrfFindContent({
    query: vectorSearchQuery,
    ftsQuery: vectorSearchQuery,
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
  experimentName: `mongodb-chatbot-retrieval-RRF?ftsWeight=${rrfFindContentConfig.config.vectorSearch.weight}&ftsWeight=${rrfFindContentConfig.config.fts.weight}&model=${retrievalConfig.embeddingModel}&@K=${k}&minScore=${retrievalConfig.findNearestNeighborsOptions.minScore}`,
  metadata: {
    description: "Evaluates quality of chatbot retrieval system.",
    retrievalConfig: rrfFindContentConfig,
  },
  data: () => getConversationRetrievalEvalData(getPath()),
  task: retrieveRelevantContentEvalTask,
  maxConcurrency: 15,
  k,
});
