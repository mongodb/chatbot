import {
  extractMongoDbMetadataFromUserMessage,
  ExtractMongoDbMetadataFunction,
} from "./extractMongoDbMetadataFromUserMessage";
import { Eval } from "braintrust";
import { Scorer } from "autoevals";
import { MongoDbTag } from "../mongoDbMetadata";
import {
  OPENAI_PREPROCESSOR_CHAT_COMPLETION_DEPLOYMENT,
  openAiClient,
} from "../eval/evalHelpers";

interface ExtractMongoDbMetadataEvalCase {
  name: string;
  input: string;
  expected: ExtractMongoDbMetadataFunction;
  tags?: MongoDbTag[];
}

const evalCases: ExtractMongoDbMetadataEvalCase[] = [
  {
    name: "should identify MongoDB Atlas Search",
    input: "Does atlas search support copy to fields",
    expected: {
      mongoDbProduct: "Atlas Search",
    } satisfies ExtractMongoDbMetadataFunction,
    tags: ["atlas", "atlas_search"],
  },
  {
    name: "should identify aggregation stage",
    input: "$merge",
    expected: {
      mongoDbProduct: "Aggregation Framework",
    } satisfies ExtractMongoDbMetadataFunction,
  },
  {
    name: "should know pymongo is python driver",
    input: "pymongo insert data",
    expected: {
      programmingLanguage: "python",
      mongoDbProduct: "Drivers",
    } satisfies ExtractMongoDbMetadataFunction,
    tags: ["driver", "python"],
  },
  {
    name: "should identify MongoDB Atlas",
    input: "how to create a new cluster atlas",
    expected: {
      mongoDbProduct: "MongoDB Atlas",
    } satisfies ExtractMongoDbMetadataFunction,
    tags: ["atlas"],
  },
  {
    name: "should know atlas billing",
    input: "how do I see my bill in atlas",
    expected: {
      mongoDbProduct: "MongoDB Atlas",
    } satisfies ExtractMongoDbMetadataFunction,
    tags: ["atlas"],
  },
  {
    name: "should be aware of vector search product",
    input: "how to use vector search",
    expected: {
      mongoDbProduct: "Atlas Vector Search",
    } satisfies ExtractMongoDbMetadataFunction,
    tags: ["atlas", "atlas_vector_search"],
  },
  {
    name: "should know change streams",
    input:
      "how to open a change stream watch on a database and filter the stream",
    expected: {
      mongoDbProduct: "Drivers",
      programmingLanguage: "javascript",
    } satisfies ExtractMongoDbMetadataFunction,
    tags: ["change_streams"],
  },
  {
    name: "should know change streams",
    input:
      "how to open a change stream watch on a database and filter the stream pymongo",
    expected: {
      mongoDbProduct: "Drivers",
      programmingLanguage: "python",
    } satisfies ExtractMongoDbMetadataFunction,
    tags: ["change_streams"],
  },
  {
    name: "should know to include programming language when coding task implied.",
    input:
      "How do I choose the order of fields when creating a compound index?",
    expected: {
      mongoDbProduct: "MongoDB Server",
      programmingLanguage: "javascript",
    } satisfies ExtractMongoDbMetadataFunction,
    tags: ["indexes"],
  },
  {
    name: "should detect gridfs usage",
    input: "What is the best way to store large files with MongoDB?",
    expected: {
      mongoDbProduct: "GridFS",
    } satisfies ExtractMongoDbMetadataFunction,
    tags: ["gridfs"],
  },
  {
    name: "should recognize MongoDB for analytics",
    input: "How do I run real-time analytics on my data?",
    expected: {
      mongoDbProduct: "MongoDB Server",
    } satisfies ExtractMongoDbMetadataFunction,
    tags: ["analytics"],
  },
  {
    name: "should detect transaction management topic",
    input: "How do I manage multi-document transactions?",
    expected: {
      mongoDbProduct: "MongoDB Server",
    } satisfies ExtractMongoDbMetadataFunction,
    tags: ["server"],
  },
  {
    name: "should know multi-cloud clustering",
    input: "Can I create a multi-cloud cluster with Atlas?",
    expected: {
      mongoDbProduct: "MongoDB Atlas",
    } satisfies ExtractMongoDbMetadataFunction,
    tags: ["atlas", "multi_cloud"],
  },
  {
    name: "should identify usage in Java with the MongoDB driver",
    input: "How do I connect to MongoDB using the Java driver?",
    expected: {
      programmingLanguage: "java",
      mongoDbProduct: "Drivers",
    } satisfies ExtractMongoDbMetadataFunction,
    tags: ["driver", "java"],
  },
  {
    name: "should know usage of MongoDB in C#",
    input: "How do I query a collection using LINQ in C#?",
    expected: {
      programmingLanguage: "csharp",
      mongoDbProduct: "Drivers",
    } satisfies ExtractMongoDbMetadataFunction,
    tags: ["driver", "csharp"],
  },
  {
    name: "should recognize Python use in aggregation queries",
    input: "How do I perform an aggregation pipeline in pymongo?",
    expected: {
      programmingLanguage: "python",
      mongoDbProduct: "Aggregation Framework",
    } satisfies ExtractMongoDbMetadataFunction,
    tags: ["driver", "python", "aggregation"],
  },
  {
    name: "should detect use of Node.js for MongoDB",
    input: "How do I handle MongoDB connections in Node.js?",
    expected: {
      programmingLanguage: "javascript",
      mongoDbProduct: "Drivers",
    } satisfies ExtractMongoDbMetadataFunction,
    tags: ["driver", "javascript"],
  },
  {
    name: "should identify usage of Go with MongoDB",
    input: "How do I insert multiple documents with the MongoDB Go driver?",
    expected: {
      programmingLanguage: "go",
      mongoDbProduct: "Drivers",
    } satisfies ExtractMongoDbMetadataFunction,
    tags: ["driver", "go"],
  },
  {
    name: "should know of $vectorSearch stage",
    input: "$vectorSearch",
    expected: {
      mongoDbProduct: "Atlas Vector Search",
    } satisfies ExtractMongoDbMetadataFunction,
    tags: ["atlas", "atlas_vector_search"],
  },
];
const ProductNameCorrect: Scorer<
  Awaited<ReturnType<typeof extractMongoDbMetadataFromUserMessage>>,
  unknown
> = (args) => {
  return {
    name: "ProductNameCorrect",
    score: args.expected?.mongoDbProduct === args.output.mongoDbProduct ? 1 : 0,
  };
};
const ProgrammingLanguageCorrect: Scorer<
  Awaited<ReturnType<typeof extractMongoDbMetadataFromUserMessage>>,
  unknown
> = (args) => {
  return {
    name: "ProgrammingLanguageCorrect",
    score:
      args.expected?.programmingLanguage === args.output.programmingLanguage
        ? 1
        : 0,
  };
};

const model = OPENAI_PREPROCESSOR_CHAT_COMPLETION_DEPLOYMENT;
Eval("extract-mongodb-metadata", {
  data: evalCases,
  experimentName: model,
  metadata: {
    description:
      "Evaluates whether the MongoDB user message guardrail is working correctly.",
    model,
  },
  maxConcurrency: 3,
  timeout: 20000,
  async task(input) {
    try {
      return await extractMongoDbMetadataFromUserMessage({
        openAiClient,
        model,
        userMessageText: input,
      });
    } catch (error) {
      console.log(`Error evaluating input: ${input}`);
      console.log(error);
      throw error;
    }
  },
  scores: [ProductNameCorrect, ProgrammingLanguageCorrect],
});
