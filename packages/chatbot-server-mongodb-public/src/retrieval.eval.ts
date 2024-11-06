import { Eval, EvalCase, EvalScorer, EvalTask } from "braintrust";
import { MongoDbTag } from "./mongoDbMetadata";
import fs from "fs";
import path from "path";
import { strict as assert } from "assert";
import { averagePrecisionAtK } from "./eval/scorers/averagePrecisionAtK";
import { getConversationsEvalCasesFromYaml } from "./eval/getConversationEvalCasesFromYaml";
import { ExtractMongoDbMetadataFunction } from "./processors/extractMongoDbMetadataFromUserMessage";
import { findContent, retrievalConfig } from "./config";
import { fuzzyLinkMatch } from "./eval/scorers/fuzzyLinkMatch";
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

const K = 5;

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
    K
  );
  return {
    name: `BinaryNDCG@${K}`,
    score: score,
  };
};

const F1AtK: RetrievalEvalScorer = async (args) => {
  const score = f1AtK(
    args.expected.links,
    args.output.results.map((r) => r.url),
    fuzzyLinkMatch,
    K
  );
  return {
    name: `F1@${K}`,
    score: score,
  };
};

const AveragePrecisionAtK: RetrievalEvalScorer = async (args) => {
  const score = averagePrecisionAtK(
    args.expected.links,
    args.output.results.map((r) => r.url),
    fuzzyLinkMatch,
    K
  );
  return {
    name: `AveragePrecision@${K}`,
    score: score,
  };
};

const PrecisionAtK: RetrievalEvalScorer = async (args) => {
  const score = precisionAtK(
    args.expected.links,
    args.output.results.map((r) => r.url),
    fuzzyLinkMatch,
    K
  );
  return {
    name: `Precision@${K}`,
    score: score,
  };
};

const RecallAtK: RetrievalEvalScorer = async (args) => {
  const score = recallAtK(
    args.expected.links,
    args.output.results.map((r) => r.url),
    fuzzyLinkMatch,
    K
  );
  return {
    name: `Recall@${K}`,
    score: score,
  };
};

const RetrievedLengthOverK: RetrievalEvalScorer = async (args) => {
  const { k } = retrievalConfig.findNearestNeighborsOptions;
  return {
    name: `RetrievedAmountOver${k}`,
    score: args.output.results.length / k,
  };
};

Eval("mongodb-chatbot-retrieval", {
  experimentName: `mongodb-chatbot-retrieval-latest?model=${retrievalConfig.model}&@K=${K}&minScore=${retrievalConfig.findNearestNeighborsOptions.minScore}`,
  metadata: {
    description: "Evaluates quality of chatbot retrieval system",
    retrievalConfig,
    K,
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
