import { Eval, EvalCase, EvalScorer, EvalTask } from "braintrust";
import { MongoDbTag } from "./mongoDbMetadata";
import fs from "fs";
import path from "path";
import { strict as assert } from "assert";
import { averagePrecisionAtK } from "./eval/scorers/averagePrecisionAtK";
import { getConversationsEvalCasesFromYaml } from "./eval/getConversationEvalCasesFromYaml";
import { ExtractMongoDbMetadataFunction } from "./processors/extractMongoDbMetadataFromUserMessage";
import { findContent, retrievalConfig } from "./config";
import { fuzzyLinkMatch } from "./eval/fuzzyLinkMatch";
import { binaryNdcgAtK } from "./eval/scorers/binaryNdcgAtK";
import { f1AtK } from "./eval/scorers/f1AtK";
import { precisionAtK } from "./eval/scorers/precisionAtK";
import { recallAtK } from "./eval/scorers/recallAtK";
import "dotenv/config";

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

const simpleConversationEvalTask: EvalTask<
  RetrievalEvalCaseInput,
  RetrievalTaskOutput
> = async function (data) {
  const results = await findContent({ query: data.query });
  return {
    results: results.content.map((c) => ({
      url: c.url,
      content: c.text,
      score: c.score,
    })),
  };
};

async function getConversationRetrievalEvalData() {
  const basePath = path.resolve(__dirname, "..", "evalCases");
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

Eval("mongodb-chatbot-retrieval", {
  experimentName: `mongodb-chatbot-retrieval-latest?model=${retrievalConfig.model}&@K=${k}&minScore=${retrievalConfig.findNearestNeighborsOptions.minScore}`,
  metadata: {
    description: "Evaluates quality of chatbot retrieval system",
    retrievalConfig,
  },
  maxConcurrency: 5,
  data: getConversationRetrievalEvalData,
  task: simpleConversationEvalTask,
  scores: [
    BinaryNdcgAtK,
    F1AtK,
    RetrievedLengthOverK,
    AveragePrecisionAtK,
    PrecisionAtK,
    RecallAtK,
  ],
});
