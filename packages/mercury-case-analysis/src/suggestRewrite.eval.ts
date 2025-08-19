import "dotenv/config";
import {
  BraintrustMiddleware,
  Eval,
  EvalCase,
  EvalScorer,
} from "mongodb-rag-core/braintrust";
import { suggestRewrite } from "./suggestRewrite";
import { createOpenAI, wrapLanguageModel } from "mongodb-rag-core/aiSdk";
import { getEnv } from "mongodb-rag-core";

const { BRAINTRUST_API_KEY, BRAINTRUST_PROXY_ENDPOINT } = getEnv({
  required: ["BRAINTRUST_API_KEY", "BRAINTRUST_PROXY_ENDPOINT"],
});

type SuggestRewriteEvalCase = EvalCase<
  {
    prompt: string;
    response: string;
    guidance: string;
  },
  {
    prompt?: string;
    response?: string;
  },
  undefined
>;

const evalCases: SuggestRewriteEvalCase[] = [
  {
    input: {
      prompt: "capital of france",
      response:
        "There are many beautiful and historic cities in Europe and often they are the capital of their respective country. For example, London is the capital of England and Paris is the capital of France.",
      guidance:
        "Make the response more concise. There is extraneous information about Europe and London, England.",
    },
    expected: {
      prompt: "What is the capital of France?",
      response: "The capital of France is Paris.",
    },
  },
  {
    input: {
      prompt: "setup atlas search index",
      response:
        "To create a search index in atlas, first go to your cluster then click search and create default index which is called default and then wait.",
      guidance:
        "Fix capitalization, use the term 'Atlas Search index', remove vague steps, and provide concise, accurate steps.",
    },
    expected: {
      prompt: "How do I create an Atlas Search index?",
      response:
        "In Atlas, open your cluster, go to Search, click Create Index, choose a collection, and save the index configuration.",
    },
  },
  {
    input: {
      prompt: "what is $lookup",
      response:
        "lookup lets you join collections like sql join and it's used for referencing data between collections",
      guidance:
        "Use proper capitalization, clarify that $lookup performs a left outer join in an aggregation pipeline, and add punctuation.",
    },
    expected: {
      prompt: "What is $lookup in MongoDB?",
      response:
        "$lookup is an aggregation stage that performs a left outer join to combine documents from another collection.",
    },
  },

  {
    input: {
      prompt: "atlas backup pricing?",
      response:
        "MongoDB Atlas backups are billed based on stored data and data transfer.",
      guidance:
        "Avoid ambiguity by referencing MongoDB Atlas specifically in the prompt.",
    },
    expected: {
      prompt: "How is MongoDB Atlas backup pricing calculated?",
    },
  },
  {
    input: {
      prompt: "How do I create a unique index in MongoDB?",
      response: "db.users.createIndex({ email: 1 }, { unique: true })",
      guidance:
        "Improve the response by adding a brief explanation and proper punctuation.",
    },
    expected: {
      response:
        "Use createIndex to enforce uniqueness: db.users.createIndex({ email: 1 }, { unique: true }). This creates a unique index on the email field.",
    },
  },
  {
    input: {
      prompt: "What does sharding do in MongoDB?",
      response: "Sharding splits data across servers to scale",
      guidance:
        "Clarify that sharding horizontally partitions data across shards and mention improved write throughput; fix punctuation.",
    },
    expected: {
      response:
        "Sharding horizontally partitions data across multiple shards (servers), enabling horizontal scale and higher write throughput.",
    },
  },
  {
    input: {
      prompt: "compass connection string?",
      response:
        "Use the mongodb+srv URI format with your username and password.",
      guidance:
        "Clarify the question and include the MongoDB context so it stands alone.",
    },
    expected: {
      prompt: "How do I configure a MongoDB connection string in Compass?",
    },
  },
  {
    input: {
      prompt: "What is a collection in MongoDB?",
      response: "It's basically a SQL table where rows are documents.",
      guidance:
        "Use precise MongoDB terminology and avoid misleading equivalences.",
    },
    expected: {
      response:
        "A collection is a grouping of documents in MongoDB. It roughly corresponds to a table in relational databases, but the schema is flexible and documents can vary.",
    },
  },
];

const generatorModel = wrapLanguageModel({
  model: createOpenAI({
    apiKey: BRAINTRUST_API_KEY,
    baseURL: BRAINTRUST_PROXY_ENDPOINT,
  }).chat("gpt-4.1"),
  middleware: [BraintrustMiddleware({ debug: true })],
});

const scorers: EvalScorer<
  SuggestRewriteEvalCase["input"],
  SuggestRewriteEvalCase["expected"],
  SuggestRewriteEvalCase["expected"],
  undefined
>[] = [
  ({ output, expected }) => ({
    name: "correct_prompt_rewrite",
    score:
      expected.prompt === undefined && output.prompt === undefined
        ? 1
        : expected.prompt !== undefined && output.prompt !== undefined
        ? 1
        : 0,
  }),
  ({ output, expected }) => ({
    name: "correct_response_rewrite",
    score:
      expected.response === undefined && output.response === undefined
        ? 1
        : expected.response !== undefined && output.response !== undefined
        ? 1
        : 0,
  }),
];

Eval("mercury-suggest-rewrite", {
  data: evalCases,
  experimentName: `suggest-rewrite-${generatorModel.modelId}`,
  metadata: {
    model: generatorModel.modelId,
    description:
      "Evaluates the quality of suggested prompt/response rewrites based on guidance.",
  },
  maxConcurrency: 10,
  async task(input) {
    try {
      return await suggestRewrite({
        generatorModel,
        prompt: input.prompt,
        response: input.response,
        guidance: input.guidance,
      });
    } catch (error) {
      console.error(`Error evaluating input: ${input}`);
      console.error(error);
      throw error;
    }
  },
  scores: scorers,
});
