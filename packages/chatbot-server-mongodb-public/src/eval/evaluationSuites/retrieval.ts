import { Eval, EvalCase, EvalScorer, EvalTask } from "braintrust";
import { MongoDbTag } from "../../mongoDbMetadata";
import { ExtractMongoDbMetadataFunction } from "../../processors/extractMongoDbMetadataFromUserMessage";
import path from "path";
import fs from "fs";
import { strict as assert } from "assert";
import { getConversationsEvalCasesFromYaml } from "../getConversationEvalCasesFromYaml";
import { fuzzyLinkMatch } from "../fuzzyLinkMatch";
import { averagePrecisionAtK } from "../scorers/averagePrecisionAtK";
import { binaryNdcgAtK } from "../scorers/binaryNdcgAtK";
import { f1AtK } from "../scorers/f1AtK";
import { precisionAtK } from "../scorers/precisionAtK";
import { recallAtK } from "../scorers/recallAtK";
export interface RetrievalEvalCaseInput {
  query: string;
}

export interface RetrievalEvalCaseExpected {
  links: string[];
}

export type RetrievalTag = "top_search_term";

export interface RetrievalEvalCase
  extends EvalCase<RetrievalEvalCaseInput, RetrievalEvalCaseExpected, unknown> {
  tags?: (MongoDbTag | RetrievalTag)[];
}

export interface RetrievalResult {
  url: string;
  content: string;
  score: number;
}
export interface RetrievalTaskOutput {
  results: RetrievalResult[];
  extractedMetadata?: ExtractMongoDbMetadataFunction;
  rewrittenQuery?: string;
  searchString?: string;
}

export type RetrievalEvalTask = EvalTask<
  RetrievalEvalCaseInput,
  RetrievalTaskOutput
>;

export type RetrievalEvalScorer = EvalScorer<
  RetrievalEvalCaseInput,
  RetrievalTaskOutput,
  RetrievalEvalCaseExpected
>;

export async function getConversationRetrievalEvalData() {
  const basePath = path.resolve(__dirname, "..", "..", "..", "..", "evalCases");
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

type MakeScorerAtK = (k: number) => RetrievalEvalScorer;
export const makeBinaryNdcgAtK: MakeScorerAtK = (k: number) => async (args) => {
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

export const makeF1AtK: MakeScorerAtK = (k: number) => async (args) => {
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

export const makeAveragePrecisionAtK: MakeScorerAtK =
  (k: number) => async (args) => {
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

export const makePrecisionAtK: MakeScorerAtK = (k: number) => async (args) => {
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

export const makeRecallAtK: MakeScorerAtK = (k: number) => async (args) => {
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

export const makeRetrievedLengthOverK: MakeScorerAtK =
  (k: number) => async (args) => {
    return {
      name: `RetrievedAmountOver${k}`,
      score: args.output.results.length / k,
    };
  };

export const AvgSearchScore: RetrievalEvalScorer = async (args) => {
  return {
    name: "AvgSearchScore",
    score:
      args.output.results.reduce((acc, r) => acc + r.score, 0) /
      args.output.results.length,
  };
};

export interface MakeRetrievalEvalParams {
  experimentName: string;
  metadata?: Record<string, unknown>;
  k: number;
  maxConcurrency?: number;
  data?: () => Promise<RetrievalEvalCase[]>;
  task: RetrievalEvalTask;
  additionalScorers?: RetrievalEvalScorer[];
}

export function runRetrievalEval({
  experimentName,
  metadata,
  k,
  task,
  maxConcurrency = 5,
  data = getConversationRetrievalEvalData,
  additionalScorers = [],
}: MakeRetrievalEvalParams) {
  return Eval("mongodb-chatbot-retrieval", {
    experimentName,
    metadata,
    maxConcurrency,
    data,
    task,
    scores: [
      makeBinaryNdcgAtK(k),
      makeF1AtK(k),
      AvgSearchScore,
      makeRetrievedLengthOverK(k),
      makeAveragePrecisionAtK(k),
      makePrecisionAtK(k),
      makeRecallAtK(k),
      ...additionalScorers,
    ],
  });
}
