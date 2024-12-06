import { Scorer, EmbeddingSimilarity } from "autoevals";
import { Eval } from "braintrust";
import {
  makeStepBackUserQuery,
  StepBackUserQueryMongoDbFunction,
} from "./makeStepBackUserQuery";
import { Message, updateFrontMatter } from "mongodb-chatbot-server";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { MongoDbTag } from "../mongoDbMetadata";
import {
  OPENAI_PREPROCESSOR_CHAT_COMPLETION_DEPLOYMENT,
  OPENAI_API_KEY,
  OPENAI_ENDPOINT,
  OPENAI_API_VERSION,
  JUDGE_EMBEDDING_MODEL,
  openAiClient,
} from "../eval/evalHelpers";

interface ExtractMongoDbMetadataEvalCase {
  name: string;
  input: {
    previousMessages?: Message[];
    userMessageText: string;
  };
  expected: StepBackUserQueryMongoDbFunction;
  tags?: MongoDbTag[];
}

const evalCases: ExtractMongoDbMetadataEvalCase[] = [
  {
    name: "Should return a step back user query",
    input: {
      userMessageText: updateFrontMatter(
        "how do i add the values of sale_price in aggregation pipeline?",
        {
          mongoDbProduct: "Aggregation Framework",
        }
      ),
    },
    expected: {
      transformedUserQuery:
        "How to calculate the sum of field in MongoDB aggregation?",
    } satisfies StepBackUserQueryMongoDbFunction,
    tags: ["aggregation"],
  },
  {
    name: "should step back based on previous messages",
    input: {
      userMessageText: "code example",
      previousMessages: [
        {
          role: "user",
          content: "add documents node.js",
          createdAt: new Date(),
          id: new ObjectId(),
        },
        {
          role: "assistant",
          content:
            "You can add documents with the node.js driver insert and insertMany methods.",
          createdAt: new Date(),
          id: new ObjectId(),
        },
      ],
    },
    expected: {
      transformedUserQuery:
        "Code example of how to add documents to MongoDB using the Node.js Driver",
    } satisfies StepBackUserQueryMongoDbFunction,
    tags: ["aggregation"],
  },
  {
    name: "should not do step back if original message doesn't need to be mutated",
    input: {
      userMessageText: updateFrontMatter("How do I connect to MongoDB Atlas?", {
        mongoDbProduct: "MongoDB Atlas",
      }),
    },
    expected: {
      transformedUserQuery: "How do I connect to MongoDB Atlas?",
    } satisfies StepBackUserQueryMongoDbFunction,
    tags: ["atlas"],
  },
  {
    name: "should step back when query about specific data",
    input: {
      userMessageText: updateFrontMatter("create an index on the email field", {
        mongoDbProduct: "Index Management",
      }),
    },
    expected: {
      transformedUserQuery:
        "How to create an index on a specific field in MongoDB?",
    } satisfies StepBackUserQueryMongoDbFunction,
    tags: ["indexes"],
  },
  {
    name: "should recognize when query doesn't need step back.",
    input: {
      userMessageText: updateFrontMatter(
        "What are MongoDB's replica set election protocols?",
        {
          mongoDbProduct: "Replication",
        }
      ),
    },
    expected: {
      transformedUserQuery:
        "What are MongoDB's replica set election protocols?",
    } satisfies StepBackUserQueryMongoDbFunction,
    tags: ["replication"],
  },
  {
    name: "Steps back when query involves MongoDB Atlas configuration",
    input: {
      userMessageText: updateFrontMatter(
        "How do I set up multi-region clusters in MongoDB Atlas?",
        {
          mongoDbProduct: "MongoDB Atlas",
        }
      ),
    },
    expected: {
      transformedUserQuery:
        "How to configure multi-region clusters in MongoDB Atlas?",
    } satisfies StepBackUserQueryMongoDbFunction,
    tags: ["atlas"],
  },
  {
    name: "Handles abstract query related to MongoDB performance tuning",
    input: {
      userMessageText: updateFrontMatter(
        "improve MongoDB query performance with indexes",
        {
          mongoDbProduct: "Performance Tuning",
        }
      ),
    },
    expected: {
      transformedUserQuery:
        "How can I use indexes to optimize MongoDB query performance?",
    } satisfies StepBackUserQueryMongoDbFunction,
    tags: ["performance", "indexes"],
  },
];

const QuerySimilarity: Scorer<
  Awaited<ReturnType<typeof makeStepBackUserQuery>>,
  unknown
> = async (args) => {
  return await EmbeddingSimilarity({
    expected: args.expected?.transformedUserQuery,
    output: args.output.transformedUserQuery,
    model: JUDGE_EMBEDDING_MODEL,
    azureOpenAi: {
      apiKey: OPENAI_API_KEY,
      apiVersion: OPENAI_API_VERSION,
      endpoint: OPENAI_ENDPOINT,
    },
  });
};

const model = OPENAI_PREPROCESSOR_CHAT_COMPLETION_DEPLOYMENT;

Eval("step-back-user-query", {
  data: evalCases,
  experimentName: model,
  metadata: {
    description:
      "Evaluate the function that mutates the user query for better search results.",
    model,
  },
  maxConcurrency: 3,
  timeout: 20000,
  async task(input) {
    try {
      return await makeStepBackUserQuery({
        openAiClient,
        model,
        ...input,
      });
    } catch (error) {
      console.log(`Error evaluating input: ${input}`);
      console.log(error);
      throw error;
    }
  },
  scores: [QuerySimilarity],
});
