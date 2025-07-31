import "dotenv/config";
import { Eval, BraintrustMiddleware } from "braintrust";
import { Scorer } from "autoevals";
import { MongoDbTag } from "mongodb-rag-core/mongoDbMetadata";
import { createOpenAI, wrapLanguageModel } from "mongodb-rag-core/aiSdk";
import { makeGenerateRating, PromptResponseRating } from "./generateRating";
import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";

const { BRAINTRUST_API_KEY, BRAINTRUST_ENDPOINT } =
  assertEnvVars(BRAINTRUST_ENV_VARS);

interface GenerateRatingEvalCase {
  input: {
    prompt: string;
    expectedResponse: string;
  };
  expected: PromptResponseRating;
  tags?: MongoDbTag[];
}

const evalCases: GenerateRatingEvalCase[] = [
  {
    input: {
      prompt: "What is the weather?",
      expectedResponse: "",
    },
    expected: {
      answer_fit: 5,
      answer_reasonableness: 5,
      business_impact: 4,
      prompt_clarity: 4,
      prompt_knowledge_assumption: 4,
    },
  },
];

const CorrectAnswerFit: Scorer<PromptResponseRating, unknown> = (args) => {
  return {
    name: "CorrectAnswerFit",
    score: args.output.answer_fit === args.expected?.answer_fit ? 1 : 0,
  };
};

const model = wrapLanguageModel({
  model: createOpenAI({
    apiKey: BRAINTRUST_API_KEY,
    baseURL: BRAINTRUST_ENDPOINT,
  }).chat("o3"),
  middleware: [BraintrustMiddleware({ debug: true })],
});

const generateRating = makeGenerateRating({
  model,
});

Eval("generate-prompt-response-rating", {
  data: evalCases,
  experimentName: "response",
  metadata: {
    description:
      "Evaluates the quality of LLM as judge in rating prompt & expected response pairs.",
    model: model.modelId,
  },
  maxConcurrency: 10,
  async task(input) {
    try {
      return await generateRating(input);
    } catch (error) {
      console.error(`Error evaluating input: ${input}`);
      console.error(error);
      throw error;
    }
  },
  scores: [CorrectAnswerFit],
});
