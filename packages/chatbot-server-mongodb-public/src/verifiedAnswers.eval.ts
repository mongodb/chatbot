import { Eval, EvalCase, EvalScorer } from "braintrust";
import { MongoDbTag } from "./mongoDbMetadata";
import {
  findVerifiedAnswer,
  verifiedAnswerConfig,
  verifiedAnswerStore,
} from "./config";
import { FindVerifiedAnswerResult } from "mongodb-chatbot-server";
import {
  parseVerifiedAnswerYaml,
  VerifiedAnswerSpec,
} from "mongodb-chatbot-verified-answers";
import path from "path";
import fs from "fs";
import "dotenv/config";
import { cosineSimilarity } from "./test/cosineSimilarity";

interface VerifiedAnswersEvalCaseInput {
  query: string;
}
interface VerifiedAnswersEvalCaseExpected {
  /**
    The expected verified answer to the query.
    If `undefined`, expects no verified answer.
   */
  answer?: string;
}

interface VerifiedAnswersEvalCaseMetadata extends Record<string, unknown> {
  similarVerifiedAnswerQuery?: string;
  description?: string;
}

type VerifiedAnswerTag = "perturbation" | "should_match" | "should_not_match";

type MongoDbVerifiedAnswerTag = MongoDbTag | VerifiedAnswerTag;

interface VerifiedAnswersEvalCase
  extends EvalCase<
    VerifiedAnswersEvalCaseInput,
    VerifiedAnswersEvalCaseExpected,
    VerifiedAnswersEvalCaseMetadata
  > {
  tags?: MongoDbVerifiedAnswerTag[];
}

type VerifiedAnswersTaskOutput = FindVerifiedAnswerResult;

type VerifiedAnswersEvalCaseScorer = EvalScorer<
  VerifiedAnswersEvalCaseInput,
  VerifiedAnswersTaskOutput,
  VerifiedAnswersEvalCaseExpected,
  VerifiedAnswersEvalCaseMetadata
>;

const verifiedAnswersPath = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "verified-answers.yaml"
);
const verifiedAnswerSpecs = parseVerifiedAnswerYaml(
  fs.readFileSync(verifiedAnswersPath, "utf-8")
);
const verifiedAnswerIndex = makeVerifiedAnswerIndex(verifiedAnswerSpecs);

const verifiedAnswerEvalCases: VerifiedAnswersEvalCase[] = [
  makeVerifiedAnswerEvalCase({
    inputQuery: "what is the aggregation framework",
    similarVerifiedAnswerQuery: "aggregation framework",
    tags: ["aggregation", "perturbation"],
    verifiedAnswerIndex,
  }),
  makeVerifiedAnswerEvalCase({
    inputQuery: "agg framework",
    similarVerifiedAnswerQuery: "aggregation framework",
    tags: ["aggregation", "perturbation", "should_match"],
    verifiedAnswerIndex,
  }),
  makeVerifiedAnswerEvalCase({
    inputQuery: "what's the process to insert data into MongoDB",
    similarVerifiedAnswerQuery: "How do I insert data into MongoDB?",
    verifiedAnswerIndex,
    tags: ["perturbation", "should_match"],
  }),
  makeVerifiedAnswerEvalCase({
    inputQuery: "How can I insert data into MongoDB?",
    similarVerifiedAnswerQuery: "How do I insert data into MongoDB?",
    verifiedAnswerIndex,
    tags: ["perturbation", "should_match"],
  }),
  makeVerifiedAnswerEvalCase({
    inputQuery: "insert data into mongodb",
    similarVerifiedAnswerQuery: "How do I insert data into MongoDB?",
    verifiedAnswerIndex,
    tags: ["perturbation", "should_match"],
  }),
  makeVerifiedAnswerEvalCase({
    inputQuery: "password reset",
    similarVerifiedAnswerQuery: "Can i reset my password",
    verifiedAnswerIndex,
    tags: ["perturbation", "iam", "should_match"],
  }),
  makeVerifiedAnswerEvalCase({
    inputQuery: "reset my password",
    similarVerifiedAnswerQuery: "Can i reset my password",
    verifiedAnswerIndex,
    tags: ["perturbation", "iam", "should_match"],
  }),
  makeVerifiedAnswerEvalCase({
    inputQuery: "reset database password",
    similarVerifiedAnswerQuery: "Can i reset my password",
    verifiedAnswerIndex,
    tags: ["perturbation", "iam", "should_match"],
  }),
  makeVerifiedAnswerEvalCase({
    inputQuery: "connect to stream process",
    verifiedAnswerIndex,
    tags: ["atlas_stream_processing", "should_not_match"],
  }),
  makeVerifiedAnswerEvalCase({
    inputQuery: "connect to database kotlin",
    verifiedAnswerIndex,
    tags: ["driver", "kotlin", "should_not_match"],
  }),
  makeVerifiedAnswerEvalCase({
    inputQuery: "connect to database with Kotlin coroutine driver",
    verifiedAnswerIndex,
    tags: ["driver", "kotlin", "kotlin_coroutine_driver", "should_not_match"],
  }),
  // 👇 From EAI-580 👇
  makeVerifiedAnswerEvalCase({
    inputQuery: "how do I set up billing alerts in Atlas",
    // No similar verified answer
    tags: ["billing", "should_not_match"],
    verifiedAnswerIndex,
  }),
];

// Helper function to create a verified answer eval case
function makeVerifiedAnswerEvalCase(args: {
  inputQuery: string;
  similarVerifiedAnswerQuery?: string;
  description?: string;
  tags?: MongoDbVerifiedAnswerTag[];
  verifiedAnswerIndex: VerifiedAnswerIndex;
}): VerifiedAnswersEvalCase {
  return {
    input: {
      query: args.inputQuery,
    },
    expected: {
      answer: args.similarVerifiedAnswerQuery
        ? findExactVerifiedAnswer(
            args.similarVerifiedAnswerQuery,
            args.verifiedAnswerIndex
          )
        : undefined,
    },
    tags: args.tags,
    metadata: {
      similarVerifiedAnswerQuery: args.similarVerifiedAnswerQuery,
      description: args.description,
    },
  };
}

// -- Evaluation metrics --
const MatchesSomeVerifiedAnswer: VerifiedAnswersEvalCaseScorer = (args) => {
  return {
    name: "MatchesSomeVerifiedAnswer",
    score: args.output.answer ? 1 : 0,
  };
};

const MatchesExpectedOutput: VerifiedAnswersEvalCaseScorer = (args) => {
  const isMatch = args.output.answer?.answer === args.expected.answer;
  let matchType = "";
  if (isMatch && args.expected.answer !== undefined) {
    matchType = "true_positive";
  } else if (isMatch && args.expected.answer === undefined) {
    matchType = "true_negative";
  } else if (!isMatch && args.expected.answer !== undefined) {
    matchType = "false_positive";
  } else if (!isMatch && args.expected.answer === undefined) {
    matchType = "false_negative";
  }

  return {
    name: "MatchesExpectedOutput",
    score: isMatch ? 1 : 0,
    metadata: {
      type: matchType,
    },
  };
};

const SearchScore: VerifiedAnswersEvalCaseScorer = (args) => {
  return {
    name: "SearchScore",
    score: args.output.answer?.score ?? null,
  };
};

const ReferenceAnswerCosineSimilarity: VerifiedAnswersEvalCaseScorer = async (
  args
) => {
  const name = "ReferenceAnswerCosineSimilarity";
  const { similarVerifiedAnswerQuery } = args.metadata;
  // Don't calculate if no reference query
  if (!similarVerifiedAnswerQuery) {
    return {
      name,
      score: null,
    };
  }
  // TODO get vector of reference query...need new method of verified answer store to get VA by query
  const similarQueryEmbedding: number[] = [];
  return {
    name,
    score: cosineSimilarity(args.output.queryEmbedding, similarQueryEmbedding),
  };
};

type VerifiedAnswerIndex = Record<string, string>;
/**
  Construct index of all verified answer for faster look up
 */
function makeVerifiedAnswerIndex(
  verifiedAnswerSpecs: VerifiedAnswerSpec[]
): VerifiedAnswerIndex {
  const verifiedAnswerIndex: VerifiedAnswerIndex = {};
  for (const { questions, answer } of verifiedAnswerSpecs) {
    questions.forEach((question) => {
      verifiedAnswerIndex[question] = answer;
    });
  }
  return verifiedAnswerIndex;
}

function findExactVerifiedAnswer(
  query: string,
  verifiedAnswerIndex: VerifiedAnswerIndex
): string | undefined {
  return verifiedAnswerIndex[query];
}

async function main() {
  await Eval<
    VerifiedAnswersEvalCaseInput,
    VerifiedAnswersTaskOutput,
    VerifiedAnswersEvalCaseExpected,
    VerifiedAnswersEvalCaseMetadata
  >("mongodb-chatbot-verified-answers", {
    experimentName: `mongodb-chatbot-latest-${verifiedAnswerConfig.embeddingModel}-minScore-${verifiedAnswerConfig.findNearestNeighborsOptions.minScore}`,
    metadata: {
      description:
        "Evaluates if gets the correct verified answers for a given query",
      verifiedAnswerConfig: verifiedAnswerConfig,
    },
    async data() {
      return verifiedAnswerEvalCases;
    },
    maxConcurrency: 5,
    async task(input) {
      const verifiedAnswer = await findVerifiedAnswer(input);
      return verifiedAnswer;
    },
    scores: [MatchesSomeVerifiedAnswer, MatchesExpectedOutput, SearchScore],
  });
  await verifiedAnswerStore.close();
}
main();
