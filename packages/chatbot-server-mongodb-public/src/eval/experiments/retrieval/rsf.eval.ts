import "dotenv/config";
import {
  CORE_ENV_VARS,
  makeMongoDbEmbeddedContentStore,
  assertEnvVars,
  MakeRsfFindContentParams,
  FindContentFunc,
  Message,
  updateFrontMatter,
  makeRsfFindContent,
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

// Set min score for calibration w/ RSF scoring
retrievalConfig.findNearestNeighborsOptions.minScore = 0.6;

// Uses same K in evals as in retrieval config.
// This is because we always return all results to the user in the chatbot.
// If we were to use the retrieval system in a different context where
// we only return the top results of a larger query,
// we could readdress this.
const { k } = retrievalConfig.findNearestNeighborsOptions;

const rsfFindContentConfig = {
  embedder,
  store: embeddedContentStore,
  config: {
    vectorSearch: {
      weight: 0.9,
      options: {
        ...retrievalConfig.findNearestNeighborsOptions,
        k: retrievalConfig.findNearestNeighborsOptions.k,
        numCandidates: retrievalConfig.findNearestNeighborsOptions.k * 5,
      },
    },
    fts: {
      indexName: FTS_INDEX_NAME,
      weight: 0.1,
      limit: retrievalConfig.findNearestNeighborsOptions.k * 2,
    },
    limit: retrievalConfig.findNearestNeighborsOptions.k,
  },
} satisfies MakeRsfFindContentParams;
const rsfFindContent = makeRsfFindContent(rsfFindContentConfig);

const retrieveRelevantContentEvalTask: RetrievalEvalTask = async function (
  data
) {
  const results = await retrieveRelevantContent({
    userMessageText: data.query,
    model: retrievalConfig.preprocessorLlm,
    openAiClient: preprocessorOpenAiClient,
    findContent: rsfFindContent,
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

  const { content, queryEmbedding } = await rsfFindContent({
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
  experimentName: `mongodb-chatbot-retrieval-RSF?vsWeight=${rsfFindContentConfig.config.vectorSearch.weight}&ftsWeight=${rsfFindContentConfig.config.fts.weight}&model=${retrievalConfig.embeddingModel}&@K=${k}&minScore=${retrievalConfig.findNearestNeighborsOptions.minScore}`,
  metadata: {
    description: "Evaluates quality of chatbot retrieval system.",
    retrievalConfig: rsfFindContentConfig,
  },
  task: retrieveRelevantContentEvalTask,
  k,
  data: () => getConversationRetrievalEvalData(getPath()),
  maxConcurrency: 10,
});
