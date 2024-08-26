import { Scorer, EmbeddingSimilarity } from "autoevals";
import { Eval } from "braintrust";
import {
  makeStepBackUserQuery,
  StepBackUserQueryMongoDbFunction,
} from "./makeStepBackUserQuery";
import { AzureOpenAI } from "openai";
import { Message, ObjectId, updateFrontMatter } from "mongodb-chatbot-server";
import { assertEnvVars } from "mongodb-chatbot-server";
import { evalEnvVars } from "../evalEnvVars";

const {
  JUDGE_OPENAI_API_KEY,
  JUDGE_EMBEDDING_MODEL,
  OPENAI_API_KEY,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
} = assertEnvVars({
  ...evalEnvVars,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT: "",
  OPENAI_API_KEY: "",
});
type StepBackUserQueryMongoDbFunctionTag = "aggregation" | "atlas";
interface ExtractMongoDbMetadataEvalCase {
  name: string;
  input: {
    previousMessages?: Message[];
    userMessageText: string;
  };
  expected: StepBackUserQueryMongoDbFunction;
  tags?: StepBackUserQueryMongoDbFunctionTag[];
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
];

const QuerySimilarity: Scorer<
  Awaited<ReturnType<typeof makeStepBackUserQuery>>,
  unknown
> = async (args) => {
  return await EmbeddingSimilarity({
    openAiApiKey: JUDGE_OPENAI_API_KEY,
    expected: args.expected?.transformedUserQuery,
    output: args.output.transformedUserQuery,
    model: JUDGE_EMBEDDING_MODEL,
  });
};

const model = OPENAI_CHAT_COMPLETION_DEPLOYMENT;
const openAiClient = new AzureOpenAI({
  apiKey: OPENAI_API_KEY,
});

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
