import { Eval, EvalCase, EvalScorer } from "braintrust";
import { MongoDbTag } from "./mongoDbMetadata";
import { findVerifiedAnswer, verifiedAnswerConfig } from "./config";
import {
  FindVerifiedAnswerResult,
  VerifiedAnswer,
} from "mongodb-chatbot-server";
import { VerfiedAnswerSpec } from "mongodb-chatbot-verified-answers";

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

type VerifiedAnswerTag = "perturbation";

type MongoDbVerifiedAnswerTag = MongoDbTag | VerifiedAnswerTag;

interface VerifiedAnswersEvalCase
  extends EvalCase<
    VerifiedAnswersEvalCaseInput,
    VerifiedAnswersEvalCaseExpected,
    VerifiedAnswersEvalCaseMetadata
  > {
  tags?: MongoDbVerifiedAnswerTag[];
}

type VerifiedAnswersTaskOutput = Omit<
  FindVerifiedAnswerResult,
  "queryEmbedding"
>;

type VerifiedAnswersEvalCaseScorer = EvalScorer<
  VerifiedAnswersEvalCaseInput,
  VerifiedAnswersTaskOutput,
  VerifiedAnswersEvalCaseExpected,
  VerifiedAnswersEvalCaseMetadata
>;

// load verified answers from the yaml file
const verifiedAnswerSpecs = [];
// create the index of VAs
const verifiedAnswerIndex = makeVerifiedAnswerIndex(verifiedAnswerSpecs);
const verifiedAnswerEvalCases: VerifiedAnswersEvalCase[] = [
  makeVerifiedAnswerEvalCase({
    inputQuery: "what is the aggregation framework",
    similarVerifiedAnswerQuery: "aggregation framework",
    tags: ["aggregation", "perturbation"],
    verifiedAnswerIndex,
  }),
];
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
  };
};

const MatchesExpectedOutput: VerifiedAnswersEvalCaseScorer = (args) => {
  const isMatch = args.output.answer === args.expected.answer;
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

Eval<
  VerifiedAnswersEvalCaseInput,
  VerifiedAnswersTaskOutput,
  VerifiedAnswersEvalCaseExpected,
  VerifiedAnswersEvalCaseMetadata
>("mongodb-chatbot-verified-answers", {
  experimentName: "mongodb-chatbot-latest",
  metadata: {
    description:
      "Evaluates if gets the correct verified answers for a given query",
    verifiedAnswerConfig: verifiedAnswerConfig,
  },
  async data() {
    // load verified answers from the yaml file
    // create the index of VAs
    return [];
  },
  maxConcurrency: 5,
  async task(input) {
    const verifiedAnswer = await findVerifiedAnswer(input);
    return {
      answer: verifiedAnswer?.answer,
    };
  },
  scores: [MatchesSomeVerifiedAnswer, MatchesExpectedOutput, SearchScore],
});

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
