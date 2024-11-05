import { Eval, EvalCase, EvalScorer, EvalTask } from "braintrust";
import { MongoDbTag } from "./mongoDbMetadata";
import fs from "fs";
import path from "path";
import { strict as assert } from "assert";
import { averagePrecisionAtK } from "./eval/scorers/averagePrecisionAtK";
import { getConversationsEvalCasesFromYaml } from "./eval/getConversationEvalCasesFromYaml";
import { ExtractMongoDbMetadataFunction } from "./processors/extractMongoDbMetadataFromUserMessage";
import { findContent } from "./config";

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

// -- Evaluation metrics --
/*
  TODO: add metrics for:
  - [ ] F1 score
  - [ ] Recall@K
  - [ ] Precision@K
  - [ ] Reciprocal Rank
  - [ ] Avg search score
  - [x] Avg precision@K (Defined below as example)
 */
const AveragePrecisionAtK: RetrievalEvalScorer = async (args) => {
  const score = averagePrecisionAtK(
    args.expected.links,
    args.output.results.map((r) => r.url),
    K
  );
  return {
    name: "AveragePrecisionAtK",
    score: score,
  };
};

Eval("mongodb-chatbot-retrieval", {
  experimentName: `mongodb-chatbot-retrieval-latest-@${K}`,
  metadata: {
    description: "Evaluates quality of chatbot retrieval system",
    embeddingModel: "TODO: add dynamically",
    K,
  },
  maxConcurrency: 5,
  data: getConversationRetrievalEvalData,
  task: simpleConversationEvalTask,
  scores: [
    AveragePrecisionAtK,
    // TODO: add other metrics here too
  ],
});
