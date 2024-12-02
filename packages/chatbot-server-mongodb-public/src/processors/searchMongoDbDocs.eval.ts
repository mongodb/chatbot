import "dotenv/config";
import { preprocessorOpenAiClient, retrievalConfig } from "../config";

import {
  getConversationRetrievalEvalData,
  RetrievalEvalTask,
  runRetrievalEval,
} from "../eval/evaluationSuites/retrieval";
import path from "path";
import { searchMongoDbDocs } from "./searchMongoDbDocs";
import { withRrfScore } from "./withRrfScore";
import { makeStepBackUserQuery } from "./makeStepBackUserQuery";
import { extractMongoDbMetadataFromUserMessage } from "./extractMongoDbMetadataFromUserMessage";
import { updateFrontMatter } from "mongodb-rag-core";

// Uses same K in evals as in retrieval config.
// This is because we always return all results to the user in the chatbot.
// If we were to use the retrieval system in a different context where
// we only return the top results of a larger query,
// we could readdress this.
const { k } = retrievalConfig.findNearestNeighborsOptions;

const retrieveRelevantContentEvalTask: RetrievalEvalTask = async function (
  data
) {
  const metadata = await extractMongoDbMetadataFromUserMessage({
    openAiClient: preprocessorOpenAiClient,
    model: retrievalConfig.preprocessorLlm,
    userMessageText: data.query,
  });
  const { transformedUserQuery } = await makeStepBackUserQuery({
    openAiClient: preprocessorOpenAiClient,
    model: retrievalConfig.preprocessorLlm,
    userMessageText: updateFrontMatter(data.query, metadata),
  });
  const { results } = await searchMongoDbDocs(
    updateFrontMatter(transformedUserQuery, metadata)
  );

  return {
    results: withRrfScore(results).map((c) => ({
      content: c.preview ?? "placeholder",
      score: c.score,
      url: c.url ?? "placeholder",
    })),
  };
};

runRetrievalEval({
  experimentName: `mongodb-chatbot-retrieval-docs-search`,
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
