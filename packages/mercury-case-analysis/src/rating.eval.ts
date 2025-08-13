import "dotenv/config";
import { Eval, BraintrustMiddleware } from "braintrust";
import { Scorer } from "autoevals";
import { MongoDbTag } from "mongodb-rag-core/mongoDbMetadata";
import { createOpenAI, wrapLanguageModel } from "mongodb-rag-core/aiSdk";
import { makeGenerateRating, PromptResponseRating } from "./rating";
import { getEnv } from "mongodb-rag-core";

const { BRAINTRUST_API_KEY, BRAINTRUST_PROXY_ENDPOINT } = getEnv({
  required: ["BRAINTRUST_API_KEY", "BRAINTRUST_PROXY_ENDPOINT"],
});

interface GenerateRatingEvalCase {
  input: {
    prompt: string;
    response: string;
  };
  expected: PromptResponseRating;
  tags?: MongoDbTag[];
}

const evalCases: GenerateRatingEvalCase[] = [
  {
    input: {
      prompt: "Is there a  limit for mongodb deletemany",
      response:
        "db.collection.deleteMany() removes all documents that match the filter from a collection.\n\nNOTE: If you are deleting all documents in a large collection, it may be faster to drop the collection and recreate it. Before dropping the collection, note all indexes on the collection. You must recreate any indexes that existed in the original collection. If the original collection was sharded, you must also shard the recreated collection.\n\nFor more information on dropping a collection, see db.collection.drop().",
    },
    expected: {
      answer_fit: {
        score: 3,
        rationale:
          "Prompt asks specifically about a possible limit on deleteMany; expected answer implicitly says it removes all matching docs and advises using drop for large collections but never explicitly states whether a limit exists. Partially addresses question but not directly or definitively.",
      },
      answer_reasonableness: {
        score: 4,
        rationale:
          "It is reasonable for an LLM to mention that deleteMany removes all matching documents and suggest dropping the collection for large-scale deletes; that is common guidance in MongoDB docs.",
      },
      business_impact: {
        score: 3,
        rationale:
          "Understanding deleteMany behavior is moderately important for applications that manage large datasets, but not highly strategic.",
      },
      prompt_clarity: {
        score: 3,
        rationale:
          "Prompt is understandable but contains a typo and lacks context or detail, making it only moderately clear.",
      },
      prompt_knowledge_assumption: {
        score: 2,
        rationale:
          "Requires only basic MongoDB CRUD knowledge; little domain depth needed.",
      },
    },
  },
  {
    input: {
      prompt: "What are best practices for mongodb pagination",
      response:
        "The following principles are best practices for paginating your Atlas Search query results:\n- Sort queries by unique fields to prevent ties in relevance scores.\n- If you want to primarily sort by a field that is not unique, add an additional sort clause on a unique field to act as a tiebreaker.\n- Sort your query results by an immutable field to ensure that your results reflect updates made between queries. \n",
    },
    expected: {
      answer_fit: {
        score: 2,
        rationale:
          "Prompt asks for general MongoDB pagination best practices, but expected answer covers only Atlas Search sorting guidance; many core practices are missing.",
      },
      answer_reasonableness: {
        score: 3,
        rationale:
          "An LLM could plausibly reply with the three listed bullets, but would usually add other common tips; partial but not implausible.",
      },
      business_impact: {
        score: 3,
        rationale:
          "Pagination efficiency affects app performance; guidance has moderate practical value.",
      },
      prompt_clarity: {
        score: 4,
        rationale:
          "Question is concise and unambiguous, though it doesn’t specify Atlas Search scope, causing mismatch.",
      },
      prompt_knowledge_assumption: {
        score: 3,
        rationale:
          "Requires some database and MongoDB operational knowledge, but not deep specialist expertise.",
      },
      guidance:
        "Answer omits several widely-recognized pagination practices (e.g. avoiding large skip, using range queries or ‘after’ cursors, leveraging _id for seek-based pagination). Either broaden the expected answer or narrow the prompt to “Atlas Search pagination sorting best practices.”",
    },
  },
  {
    input: {
      prompt: "How to use  unset field in array mongodb",
      response:
        'To use the $unset operator on a field that contains an array, use the update method with a filter to identify the specific value in the array that you want to unset and the $ operator to unset that value. \n\n```\ndb.grades.insertMany([{user: "A", grades: [90, 30, 40]}, {user: "B", grades: [30, 70, 60]}])\n\ndb.grades.updateMany({grades: 30}, {$unset: {"grades.$": 1}})\n```\n\nWhen the operation is complete, the value that matches the filter in the array is changed to null.\n',
    },
    expected: {
      answer_fit: {
        score: 1,
        rationale:
          "$unset with 'grades.$' is invalid in MongoDB; the operation shown would fail. Therefore the answer does not correctly satisfy the prompt.",
      },
      answer_reasonableness: {
        score: 3,
        rationale:
          "Given the vague prompt, an LLM might guess the misuse of $unset and $; although wrong, it’s a plausible but not authoritative response.",
      },
      business_impact: {
        score: 3,
        rationale:
          "Array updates are common developer tasks; wrong guidance could cause wasted time but not critical business failure.",
      },
      prompt_clarity: {
        score: 3,
        rationale:
          "Prompt is understandable but ungrammatical; intent is clear enough.",
      },
      prompt_knowledge_assumption: {
        score: 3,
        rationale:
          "Requires basic MongoDB update knowledge; moderate domain specificity.",
      },
      guidance:
        'The answer is technically incorrect: $unset cannot be combined with the positional $ operator. To null-out an array element you must reference it by index (e.g., {$unset:{"grades.0":1}}) or use $set with the positional operator. Clarify the prompt (“How do I unset/remove a single element inside an array in MongoDB?”) and ensure the expected answer reflects MongoDB’s documented behavior.',
    },
  },
  {
    input: {
      prompt: "How can i combine vector search with lexical search?",
      response: "[TO FILL] update when $rankFusion syntax is released",
    },
    expected: {
      answer_fit: {
        score: 1,
        rationale: "No substantive content; expected answer is a placeholder.",
      },
      answer_reasonableness: {
        score: 1,
        rationale:
          "An LLM cannot derive a full answer from the placeholder; unreasonable to expect a correct output.",
      },
      business_impact: {
        score: 3,
        rationale:
          "Hybrid search guidance is valuable for many search applications, but impact is undermined by missing answer.",
      },
      prompt_clarity: {
        score: 4,
        rationale: "Direct, concise question; understandable.",
      },
      prompt_knowledge_assumption: {
        score: 3,
        rationale:
          "Assumes familiarity with search paradigms but not excessively specialized.",
      },
      guidance:
        "The expected answer is missing, so scores for fit and reasonableness are 1. Provide a complete answer explaining concrete techniques (e.g., hybrid search, result fusion, the upcoming $rankFusion syntax) and practical examples. Clarify any prerequisites, such as the search engine or framework in use, to let respondents tailor detailed guidance.",
    },
  },
];

const model = wrapLanguageModel({
  model: createOpenAI({
    apiKey: BRAINTRUST_API_KEY,
    baseURL: BRAINTRUST_PROXY_ENDPOINT,
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
  scores: (
    [
      "answer_fit",
      "answer_reasonableness",
      "business_impact",
      "prompt_clarity",
      "prompt_knowledge_assumption",
    ] satisfies (keyof PromptResponseRating)[]
  ).map((key): Scorer<PromptResponseRating, unknown> => {
    return ({ output, expected }) => ({
      name: `correct_${key}`,
      score: 1 - Math.abs(output[key].score - (expected?.[key].score ?? 0)) / 4,
    });
  }),
});
