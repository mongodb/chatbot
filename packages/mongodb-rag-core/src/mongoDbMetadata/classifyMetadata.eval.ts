import "dotenv/config";
import { strict as assert } from "assert";
import { Eval } from "../braintrust";
import { Scorer } from "autoevals";
import { classifyMongoDbMetadata, MongoDbTag } from "./";
import { createOpenAI } from "@ai-sdk/openai";
import { getOpenAiEndpointAndApiKey, models } from "../models";

async function main() {
  const modelLabel = "gpt-4.1";
  const modelConfig = models.find((m) => m.label === modelLabel);
  assert(modelConfig, `Model ${modelLabel} not found`);

  const openai = createOpenAI({
    ...(await getOpenAiEndpointAndApiKey(modelConfig)),
  });

  interface ClassifyMongoDbMetadataEvalCase {
    name: string;
    input: string;
    expected: Awaited<ReturnType<typeof classifyMongoDbMetadata>>;
    tags?: MongoDbTag[];
  }

  const evalCases: ClassifyMongoDbMetadataEvalCase[] = [
    {
      name: "should identify MongoDB Atlas Search",
      input: "Does atlas search support copy to fields",
      expected: {
        product: "atlas_search",
        programmingLanguage: null,
        topic: null,
      },
      tags: ["atlas", "atlas_search"],
    },
    {
      name: "should identify aggregation stage",
      input: "$merge",
      expected: {
        product: "aggregation",
        programmingLanguage: null,
        topic: "queries",
      },
      tags: ["aggregation"],
    },
    {
      name: "should know pymongo is python driver",
      input: "pymongo insert data",
      expected: {
        programmingLanguage: "python",
        product: "driver",
        topic: "troubleshoot_debug",
      },
      tags: ["driver", "python"],
    },
    {
      name: "should identify MongoDB Atlas",
      input: "how to create a new cluster atlas",
      expected: {
        product: "atlas",
        programmingLanguage: null,
        topic: null,
      },
      tags: ["atlas"],
    },
    {
      name: "should know atlas billing",
      input: "how do I see my bill in atlas",
      expected: {
        product: "atlas",
        programmingLanguage: null,
        topic: "billing",
      },
      tags: ["atlas"],
    },
    {
      name: "should be aware of vector search product",
      input: "how to use vector search",
      expected: {
        product: "atlas_vector_search",
        programmingLanguage: null,
        topic: "search",
      },
      tags: ["atlas", "atlas_vector_search"],
    },
    {
      name: "should know change streams",
      input:
        "how to open a change stream watch on a database and filter the stream",
      expected: {
        product: "change_streams",
        programmingLanguage: "javascript",
        topic: "change_streams",
      },
      tags: ["change_streams"],
    },
    {
      name: "should know change streams",
      input:
        "how to open a change stream watch on a database and filter the stream pymongo",
      expected: {
        product: "driver",
        programmingLanguage: "python",
        topic: "change_streams",
      },
      tags: ["change_streams"],
    },
    {
      name: "should know to include programming language when coding task implied.",
      input:
        "How do I choose the order of fields when creating a compound index?",
      expected: {
        product: "server",
        programmingLanguage: "javascript",
        topic: "indexes",
      },
      tags: ["indexes"],
    },
    {
      name: "should detect gridfs usage",
      input: "What is the best way to store large files with MongoDB?",
      expected: {
        product: "gridfs",
        programmingLanguage: null,
        topic: "performance",
      },
      tags: ["gridfs"],
    },
    {
      name: "should recognize MongoDB for analytics",
      input: "How do I run real-time analytics on my data?",
      expected: {
        product: "server",
        programmingLanguage: null,
        topic: "analytics",
      },
      tags: ["analytics"],
    },
    {
      name: "should detect transaction management topic",
      input: "How do I manage multi-document transactions?",  // TODO potentially should add transaction topic or smth about how databases work
      expected: {
        product: "server",
        programmingLanguage: null,
        topic: "performance",
      },
      tags: ["server"],
    },
    {
      name: "should know multi-cloud clustering",
      input: "Can I create a multi-cloud cluster with Atlas?",
      expected: {
        product: "atlas",
        programmingLanguage: null,
        topic: "multi_cloud",
      },
      tags: ["atlas", "multi_cloud"],
    },
    {
      name: "should identify usage in Java with the MongoDB driver",
      input: "How do I connect to MongoDB using the Java driver?",
      expected: {
        programmingLanguage: "java",
        product: "driver",
        topic: "monitoring",
      },
      tags: ["driver", "java"],
    },
    {
      name: "should know usage of MongoDB in C#",
      input: "How do I query a collection using LINQ in C#?",
      expected: {
        programmingLanguage: "csharp",
        product: "driver",
        topic: "queries",
      },
      tags: ["driver", "csharp"],
    },
    {
      name: "should recognize Python use in aggregation queries",
      input: "How do I perform an aggregation pipeline in pymongo?",
      expected: {
        programmingLanguage: "python",
        product: "aggregation",
        topic: "queries",
      },
      tags: ["driver", "python", "aggregation"],
    },
    {
      name: "should detect use of Node.js for MongoDB",
      input: "How do I handle MongoDB connections in Node.js?",
      expected: {
        programmingLanguage: "javascript",
        product: "driver",
        topic: "troubleshoot_debug",
      },
      tags: ["driver", "javascript"],
    },
    {
      name: "should identify usage of Go with MongoDB",
      input: "How do I insert multiple documents with the MongoDB Go driver?",
      expected: {
        programmingLanguage: "go",
        product: "driver",
        topic: "queries",
      },
      tags: ["driver", "go"],
    },
    {
      name: "should know of $vectorSearch stage",
      input: "$vectorSearch",
      expected: {
        product: "atlas_vector_search",
        programmingLanguage: null,
        topic: "search",
      },
      tags: ["atlas", "atlas_vector_search"],
    },
  ];

  const ProductNameCorrect: Scorer<
    Awaited<ReturnType<typeof classifyMongoDbMetadata>>,
    unknown
  > = (args) => {
    return {
      name: "ProductNameCorrect",
      score: args.expected?.product === args.output.product ? 1 : 0,
    };
  };

  const ProgrammingLanguageCorrect: Scorer<
    Awaited<ReturnType<typeof classifyMongoDbMetadata>>,
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

  const TopicCorrect: Scorer<
    Awaited<ReturnType<typeof classifyMongoDbMetadata>>, unknown
  > = (args) => {
    return {
      name: "TopicCorrect",
      score: args.expected?.topic === args.output.topic ? 1 : 0,
    };
  };


  Eval("classify-mongodb-metadata", {
    data: evalCases,
    experimentName: modelLabel,
    metadata: {
      description:
        "Evaluates whether the MongoDB metadata classifier is working correctly",
      model: modelLabel,
    },
    maxConcurrency: 15,
    timeout: 20000,
    async task(input) {
      try {
        return await classifyMongoDbMetadata(
          openai.languageModel(modelLabel),
          input
        );
      } catch (error) {
        console.log(`Error evaluating input: ${input}`);
        console.log(error);
        throw error;
      }
    },
    scores: [ProductNameCorrect, ProgrammingLanguageCorrect, TopicCorrect],
  });
}

main();
