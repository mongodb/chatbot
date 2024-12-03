import "dotenv/config";
import {
  retrievalConfig,
  preprocessorOpenAiClient,
  findContent,
} from "../config";
import { extractMongoDbMetadataFromUserMessage } from "./extractMongoDbMetadataFromUserMessage";
import { retrieveRelevantContent } from "./retrieveRelevantContent";
import {
  getConversationRetrievalEvalData,
  RetrievalEvalTask,
  runRetrievalEval,
} from "../eval/evaluationSuites/retrieval";
import path from "path";

// Uses same K in evals as in retrieval config.
// This is because we always return all results to the user in the chatbot.
// If we were to use the retrieval system in a different context where
// we only return the top results of a larger query,
// we could readdress this.
const { k } = retrievalConfig;

const retrieveRelevantContentEvalTask: RetrievalEvalTask = async function (
  data
) {
  const metadataForQuery = await extractMongoDbMetadataFromUserMessage({
    openAiClient: preprocessorOpenAiClient,
    model: retrievalConfig.preprocessorLlm,
    userMessageText: data.query,
  });
  const results = await retrieveRelevantContent({
    userMessageText: data.query,
    model: retrievalConfig.preprocessorLlm,
    openAiClient: preprocessorOpenAiClient,
    findContent,
    metadataForQuery,
    k,
  });

  return {
    results: results.content.map((c) => ({
      url: c.url,
      content: c.text,
      score: c.score,
    })),
    extractedMetadata: metadataForQuery,
    rewrittenQuery: results.transformedUserQuery,
    searchString: results.searchQuery,
  };
};

runRetrievalEval({
  experimentName: `mongodb-chatbot-retrieval-latest?model=${retrievalConfig.embeddingModel}&@K=${k}&minScore=${retrievalConfig.findNearestNeighborsOptions.minScore}`,
  metadata: {
    description: "Evaluates quality of chatbot retrieval system",
    retrievalConfig,
  },
  data: () =>
    getConversationRetrievalEvalData(
      path.resolve(
        __dirname,
        "..",
        "..",
        "evalCases",
        "included_links_conversations.yml"
      )
    ),
  task: retrieveRelevantContentEvalTask,
  maxConcurrency: 15,
  k,
});
