import { Eval } from "braintrust";
import { Faithfulness, AnswerRelevancy, ContextRelevancy } from "autoevals";
import "dotenv/config";
import { strict as assert } from "assert";
assert(process.env.OPENAI_OPENAI_API_KEY, "need openai key from openai");
const openAiApiKey = process.env.OPENAI_OPENAI_API_KEY;
const model = "gpt-4o-mini";
const evaluatorLlmConf = {
  openAiApiKey,
  model,
};
/**
  Evaluate whether the output is faithful to the model input.
 */
const makeAnswerFaithfulness = function (args: {
  input: string;
  output: string;
  metadata: { context: string[] };
}) {
  return Faithfulness({
    input: args.input,
    output: args.output,
    context: args.metadata.context,
    ...evaluatorLlmConf,
  });
};

/**
  Evaluate whether answer is relevant to the input.
 */
const makeAnswerRelevance = function (args: {
  input: string;
  output: string;
  metadata: { context: string[] };
}) {
  return AnswerRelevancy({
    input: args.input,
    output: args.output,
    context: args.metadata.context,
    ...evaluatorLlmConf,
  });
};

/**
  Evaluate whether context is relevant to the input.
 */
const makeContextRelevance = function (args: {
  input: string;
  output: string;
  metadata: { context: string[] };
}) {
  return ContextRelevancy({
    input: args.input,
    output: args.output,
    context: args.metadata.context,
    ...evaluatorLlmConf,
  });
};

const dataset = [
  {
    input: "What is the capital of France",
    tags: ["paris"],
    metadata: {
      context: [
        "The capital of France is Paris.",
        "Berlin is the capital of Germany.",
      ],
    },
    output: "Paris is the capital of France.",
  },
  {
    input: "Who wrote Harry Potter",
    tags: ["harry-potter"],
    metadata: {
      context: [
        "Harry Potter was written by J.K. Rowling.",
        "The Lord of the Rings was written by J.R.R. Tolkien.",
      ],
    },
    output: "J.R.R. Tolkien wrote Harry Potter.",
  },
  {
    input: "What is the largest planet in our solar system",
    tags: ["jupiter"],
    metadata: {
      context: [
        "Jupiter is the largest planet in our solar system.",
        "Saturn has the largest rings in our solar system.",
      ],
    },
    output: "Saturn is the largest planet in our solar system.",
  },
];

function makeGeneratedAnswerReturner(outputs: string[]) {
  // closure over iterator
  let counter = 0;
  return async (_input: string) => {
    counter++;
    return outputs[counter - 1];
  };
}

Eval("mdb-test", {
  experimentName: "rag-metrics",
  metadata: {
    testing: true,
  },

  data: () => {
    return dataset;
  },
  task: makeGeneratedAnswerReturner(dataset.map((d) => d.output)),
  scores: [makeAnswerFaithfulness, makeAnswerRelevance, makeContextRelevance],
});
