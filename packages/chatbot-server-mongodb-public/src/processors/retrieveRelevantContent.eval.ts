import "dotenv/config";
import {
  Eval,
  EvalCase,
  EvalScorer,
  EvalTask,
} from "mongodb-rag-core/braintrust";
import fs from "fs";
import path from "path";
import { strict as assert } from "assert";
import {
  retrievalConfig,
  findContent,
  preprocessorOpenAiClient,
} from "../config";
import { fuzzyLinkMatch } from "../eval/fuzzyLinkMatch";
import { getConversationsEvalCasesFromYaml } from "mongodb-rag-core/eval";
import { averagePrecisionAtK } from "../eval/scorers/averagePrecisionAtK";
import { binaryNdcgAtK } from "../eval/scorers/binaryNdcgAtK";
import { f1AtK } from "../eval/scorers/f1AtK";
import { precisionAtK } from "../eval/scorers/precisionAtK";
import { recallAtK } from "../eval/scorers/recallAtK";
import { MongoDbTag } from "../mongoDbMetadata";
import {
  extractMongoDbMetadataFromUserMessage,
  ExtractMongoDbMetadataFunction,
} from "./extractMongoDbMetadataFromUserMessage";
import { retrieveRelevantContent } from "./retrieveRelevantContent";

interface RetrievalEvalCaseInput {
  query: string;
}

interface RetrievalEvalCaseExpected {
  links: string[];
}

type RetrievalTag = "top_search_term";

interface RetrievalEvalCase
  extends EvalCase<RetrievalEvalCaseInput, RetrievalEvalCaseExpected, unknown> {
  tags?: (MongoDbTag | RetrievalTag)[];
}

interface RetrievalResult {
  url: string;
  content: string;
  score: number;
}
interface RetrievalTaskOutput {
  results: RetrievalResult[];
  extractedMetadata?: ExtractMongoDbMetadataFunction;
  rewrittenQuery?: string;
  searchString?: string;
}

type RetrievalEvalScorer = EvalScorer<
  RetrievalEvalCaseInput,
  RetrievalTaskOutput,
  RetrievalEvalCaseExpected
>;

// Uses same K in evals as in retrieval config.
// This is because we always return all results to the user in the chatbot.
// If we were to use the retrieval system in a different context where
// we only return the top results of a larger query,
// we could readdress this.
const { k } = retrievalConfig.findNearestNeighborsOptions;

const retrieveRelevantContentEvalTask: EvalTask<
  RetrievalEvalCaseInput,
  RetrievalTaskOutput
> = async function (data) {
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

async function getConversationRetrievalEvalData() {
  const basePath = path.resolve(__dirname, "..", "..", "evalCases");
  const includedLinksConversations = getConversationsEvalCasesFromYaml(
    fs.readFileSync(
      path.resolve(basePath, "included_links_conversations.yml"),
      "utf8"
    )
  );
  return includedLinksConversations.map((evalCase) => {
    const latestMessageText = evalCase.messages.at(-1)?.content;
    assert(latestMessageText, "No latest message text found");
    assert(evalCase.expectedLinks, "No expected links found");
    return {
      tags: evalCase.tags as MongoDbTag[],
      input: {
        query: latestMessageText,
      },
      expected: { links: evalCase.expectedLinks },
      metadata: null,
    } satisfies RetrievalEvalCase;
  });
}

const BinaryNdcgAtK: RetrievalEvalScorer = async (args) => {
  const score = binaryNdcgAtK(
    args.expected.links,
    args.output.results.map((r) => r.url),
    fuzzyLinkMatch,
    k
  );
  return {
    name: `BinaryNDCG@${k}`,
    score: score,
  };
};

const F1AtK: RetrievalEvalScorer = async (args) => {
  const score = f1AtK(
    args.expected.links,
    args.output.results.map((r) => r.url),
    fuzzyLinkMatch,
    k
  );
  return {
    name: `F1@${k}`,
    score: score,
  };
};

const AveragePrecisionAtK: RetrievalEvalScorer = async (args) => {
  const score = averagePrecisionAtK(
    args.expected.links,
    args.output.results.map((r) => r.url),
    fuzzyLinkMatch,
    k
  );
  return {
    name: `AveragePrecision@${k}`,
    score: score,
  };
};

const PrecisionAtK: RetrievalEvalScorer = async (args) => {
  const score = precisionAtK(
    args.expected.links,
    args.output.results.map((r) => r.url),
    fuzzyLinkMatch,
    k
  );
  return {
    name: `Precision@${k}`,
    score: score,
  };
};

const RecallAtK: RetrievalEvalScorer = async (args) => {
  const score = recallAtK(
    args.expected.links,
    args.output.results.map((r) => r.url),
    fuzzyLinkMatch,
    k
  );
  return {
    name: `Recall@${k}`,
    score: score,
  };
};

const RetrievedLengthOverK: RetrievalEvalScorer = async (args) => {
  return {
    name: `RetrievedAmountOver${k}`,
    score: args.output.results.length / k,
  };
};

const AvgSearchScore: RetrievalEvalScorer = async (args) => {
  return {
    name: "AvgSearchScore",
    score:
      args.output.results.reduce((acc, r) => acc + r.score, 0) /
      args.output.results.length,
  };
};

Eval("mongodb-chatbot-retrieval", {
  experimentName: `mongodb-chatbot-retrieval-latest?model=${retrievalConfig.embeddingModel}&@K=${k}&minScore=${retrievalConfig.findNearestNeighborsOptions.minScore}`,
  metadata: {
    description: "Evaluates quality of chatbot retrieval system",
    retrievalConfig,
  },
  maxConcurrency: 5,
  data: getConversationRetrievalEvalData,
  task: retrieveRelevantContentEvalTask,
  scores: [
    BinaryNdcgAtK,
    F1AtK,
    AvgSearchScore,
    RetrievedLengthOverK,
    AveragePrecisionAtK,
    PrecisionAtK,
    RecallAtK,
  ],
});
