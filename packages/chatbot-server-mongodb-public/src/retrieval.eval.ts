import { Eval, EvalCase, EvalScorer } from "braintrust";
import { MongoDbTag } from "./mongoDbMetadata";
import { Conversation, Message, ObjectId } from "mongodb-chatbot-server";
import fs from "fs";
import path from "path";
import { getConversationsEvalCasesFromYaml } from "./test/getConversationEvalCasesFromYaml";
import { strict as assert } from "assert";
import { averagePrecisionAtK } from "./evalMetrics/retrieval/averagePrecisionAtK";

interface ConversationEvalCaseInput {
  previousConversation: Conversation;
  latestMessageText: string;
}

interface RetrievalEvalCaseExpected {
  urls: string[];
}

interface RetrievalEvalCase
  extends EvalCase<ConversationEvalCaseInput, unknown, unknown> {
  name: string;
  input: ConversationEvalCaseInput;
  tags?: MongoDbTag[];
  expected: RetrievalEvalCaseExpected;
}

interface RetrievalResult {
  url: string;
  content: string;
  score: number;
}
interface RetrievalTaskOutput {
  results: RetrievalResult[];
}

type RetrievalEvalScorer = EvalScorer<
  ConversationEvalCaseInput,
  RetrievalTaskOutput,
  RetrievalEvalCaseExpected
>;

const K = 5;

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
    args.expected.urls,
    args.output.results.map((r) => r.url),
    K
  );
  return {
    name: "AveragePrecisionAtK",
    score: score,
  };
};

Eval("mongodb-chatbot-retrieval", {
  data: async () => {
    const basePath = path.resolve(__dirname, "..", "evalCases");
    const includedLinksConversations = getConversationsEvalCasesFromYaml(
      fs.readFileSync(
        path.resolve(basePath, "included_links_conversations.yml"),
        "utf8"
      )
    );
    return includedLinksConversations.map((evalCase) => {
      const prevConversationMessages = evalCase.messages.slice(0, -1).map(
        (m) =>
          ({
            content: m.content,
            role: m.role,
            id: new ObjectId(),
            createdAt: new Date(),
          } satisfies Message)
      );
      const latestMessageText = evalCase.messages.at(-1)?.content;
      assert(latestMessageText, "No latest message text found");
      assert(evalCase.expectedLinks, "No expected links found");
      return {
        name: evalCase.name,
        tags: evalCase.tags as MongoDbTag[],
        input: {
          latestMessageText,
          previousConversation: {
            messages: prevConversationMessages,
            _id: new ObjectId(),
            createdAt: new Date(),
          },
        },
        expected: { urls: evalCase.expectedLinks },
        metadata: null,
      } satisfies RetrievalEvalCase;
    });
  },
  experimentName: "mongodb-chatbot-retrieval-latest",
  metadata: {
    description: "Evaluates quality of chatbot retrieval system",
    embeddingModel: "TODO: add dynamically",
    // TODO: add other config info
  },
  maxConcurrency: 2,
  async task(input): Promise<RetrievalTaskOutput> {
    // TODO: Do retrieval
    return {
      results: [],
    };
  },
  scores: [
    AveragePrecisionAtK,
    // TODO: add other metrics here too
  ],
});
