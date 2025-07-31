import "dotenv/config";
import { Eval, BraintrustMiddleware } from "braintrust";
import { Scorer } from "autoevals";
import { MongoDbTag } from "mongodb-rag-core/mongoDbMetadata";
import { createOpenAI, wrapLanguageModel } from "mongodb-rag-core/aiSdk";
import {
  assertEnvVars,
  BRAINTRUST_ENV_VARS,
  makeOpenAiEmbedder,
} from "mongodb-rag-core";
import { Relevance } from "./Case";
import { assessRelevance } from "./assessRelevance";
import { AzureOpenAI } from "mongodb-rag-core/openai";
import { makeSimpleTextGenerator } from "./SimpleTextGenerator";

const {
  OPENAI_API_KEY,
  OPENAI_ENDPOINT,
  OPENAI_API_VERSION,
  OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
  BRAINTRUST_API_KEY,
  BRAINTRUST_ENDPOINT,
} = assertEnvVars({
  OPENAI_API_KEY: "",
  OPENAI_ENDPOINT: "",
  OPENAI_API_VERSION: "",
  OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT: "",
  ...BRAINTRUST_ENV_VARS,
});

interface AssessRelevanceEvalCase {
  input: {
    prompt: string;
    expectedResponse: string;
  };
  expected: Pick<Relevance, "averages">;
  tags?: MongoDbTag[];
}

const evalCases: AssessRelevanceEvalCase[] = [
  {
    // High similarity
    input: {
      prompt: "When to use $pull and $push mongodb",
      expectedResponse:
        "Use the $pull operator when you want to remove a value or values that match specific conditions from an existing array. \nUse the $push operator when you want to add a specific value to an array. ",
    },
    expected: {
      averages: {
        cos_similarity: 0.9639615103046141,
        norm_sq_mag_diff: 1.876484720646915e-11,
      },
    },
  },
  {
    // Low similarity
    input: {
      prompt: "give me an example of how to use the $and operator",
      expectedResponse:
        "The following example returns inventory documents where the price is greater than 25 and the quantity is less than 20:\n\ndb.inventory.find( {\n  $and: [\n    { price: { $gt: 25 } },\n    { quantity: { $lt: 20 } }\n  ]\n} )",
    },
    expected: {
      averages: {
        cos_similarity: 0.3442199438560915,
        norm_sq_mag_diff: 1.0454893515591396e-10,
      },
    },
  },
];

const cosSimilarityScorer: Scorer<Pick<Relevance, "averages">, unknown> = ({
  output,
  expected,
}) => ({
  name: `closeCosSimilarity`,
  score:
    expected === undefined
      ? 0
      : 1 -
        Math.abs(
          output.averages.cos_similarity - expected.averages.cos_similarity
        ),
});

const model = wrapLanguageModel({
  model: createOpenAI({
    apiKey: BRAINTRUST_API_KEY,
    baseURL: BRAINTRUST_ENDPOINT,
  }).chat("o3"),
  middleware: [BraintrustMiddleware({ debug: true })],
});

const openAiClient = new AzureOpenAI({
  apiKey: OPENAI_API_KEY,
  endpoint: OPENAI_ENDPOINT,
  apiVersion: OPENAI_API_VERSION,
});

const embedders = [
  makeOpenAiEmbedder({
    openAiClient,
    deployment: OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
    backoffOptions: {
      numOfAttempts: 25,
      startingDelay: 1000,
    },
  }),
];

const generate = makeSimpleTextGenerator({
  model: wrapLanguageModel({
    model: createOpenAI({
      apiKey: BRAINTRUST_API_KEY,
      baseURL: BRAINTRUST_ENDPOINT,
    }).chat("gpt-4.1"),
    middleware: [BraintrustMiddleware({ debug: true })],
  }),
});

Eval("assess-prompt-response-relevance", {
  data: evalCases,
  experimentName: "assess-relevance",
  metadata: {
    description: "Evaluates assessRelevance().",
    model: model.modelId,
  },
  maxConcurrency: 10,
  async task({ prompt, expectedResponse }) {
    try {
      return await assessRelevance({
        prompt,
        expectedResponse,
        embedders,
        generate,
      });
    } catch (error) {
      console.error(`Error evaluating input: ${prompt} - ${expectedResponse}`);
      console.error(error);
      throw error;
    }
  },
  scores: [cosSimilarityScorer],
});
