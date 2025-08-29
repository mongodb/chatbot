import "dotenv/config";
import { strict as assert } from "assert";
import { Eval, BraintrustMiddleware } from "../braintrust";
import { Scorer } from "autoevals";
import { classifyMongoDbMetadata, MongoDbTag } from "./";
import { createOpenAI, wrapLanguageModel } from "../aiSdk";
import { getOpenAiEndpointAndApiKey, models } from "../models";

async function main() {
  const modelLabel = "gpt-4.1-mini";
  const modelConfig = models.find((m) => m.label === modelLabel);
  assert(modelConfig, `Model ${modelLabel} not found`);

  const openai = createOpenAI({
    ...(await getOpenAiEndpointAndApiKey(modelConfig)),
  });

  type MetadataClassifierEvalOutput = Partial<
    Awaited<ReturnType<typeof classifyMongoDbMetadata>>
  >;

  interface ClassifyMongoDbMetadataEvalCase {
    name: string;
    input: string;
    expected: MetadataClassifierEvalOutput;
    tags?: MongoDbTag[];
  }

  const k8sAsTag = "kubernetes" as MongoDbTag;

  const evalCases: ClassifyMongoDbMetadataEvalCase[] = [
    {
      name: "should identify MongoDB Atlas Search",
      input: "Does atlas search support copy to fields",
      expected: {
        product: "atlas_search",
        topic: "search",
      },
      tags: ["atlas", "atlas_search"],
    },
    {
      name: "should identify aggregation stage",
      input: "$merge",
      expected: {
        product: "aggregation",
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
        topic: "queries",
      },
      tags: ["driver", "python"],
    },
    {
      name: "should identify MongoDB Atlas",
      input: "how to create a new cluster atlas",
      expected: {
        product: "atlas",
        programmingLanguage: null,
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
        topic: "analytics",
      },
      tags: ["analytics"],
    },
    {
      name: "should detect transaction management topic",
      input: "How do I manage multi-document transactions?",
      expected: {
        product: "server",
        topic: "performance",
      },
      tags: ["server"],
    },
    {
      name: "should know multi-cloud clustering",
      input: "Can I create a multi-cloud cluster with Atlas?",
      expected: {
        product: "atlas",
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
        topic: "search",
      },
      tags: ["atlas", "atlas_vector_search"],
    },
    {
      name: "should identify community k8s without exact reference",
      input: "run mongodb on kubernetes on local machine",
      expected: {
        product: "community_kubernetes_operator",
      },
      tags: [k8sAsTag],
    },
    {
      name: "should identify k8s enterprise",
      input:
        "What versions of MongoDB does the Enterprise Kubernetes Operator support?",
      expected: {
        product: "enterprise_kubernetes_operator",
      },
      tags: [k8sAsTag],
    },
    {
      name: "should identify atlas k8s",
      input: "manage atlas mongodb cluster users from kubernetes",
      expected: {
        product: "atlas_operator",
        programmingLanguage: null,
        topic: "iam",
      },
      tags: [k8sAsTag, "atlas"],
    },
    {
      name: "should identify k8s controllers",
      input: "deploy mongodb as multi-cluster k8s",
      expected: {
        product: "mongodb_kubernetes_controllers",
      },
      tags: [k8sAsTag],
    },
    {
      name: "should classify mongosh as mongodb shell",
      input: "How to connect to database mongosh",
      expected: {
        product: "shell",
        programmingLanguage: "shell",
      },
      tags: ["shell"],
    },
    {
      name: "should identify maintenance topic",
      input: "upgrade mongodb 5 to 7",
      expected: {
        product: "server",
        topic: "maintenance",
      },
      tags: [],
    },
    {
      name: "should identify relational migrator",
      input: "migrate from postgres to mongodb",
      expected: {
        product: "relational_migrator",
        programmingLanguage: null,
        topic: "migration",
      },
      tags: [],
    },
    {
      name: "should identify skills",
      input: "what skills badge is right for me as a beginner",
      expected: {
        product: "skills",
        programmingLanguage: null,
        topic: "mongodb_university",
      },
      tags: ["mongodb_university"],
    },
    {
      name: "should identify certificate exam",
      input: "mock exams for associate developer certificate",
      expected: {
        product: "mongodb_university",
        programmingLanguage: null,
        topic: "certificate_exam",
      },
      tags: ["mongodb_university"],
    },
    {
      name: "should identify data modeling",
      input: "when should i use nested documents vs creating a new collection",
      expected: {
        product: "server",
        programmingLanguage: null,
        topic: "data_modeling",
      },
      tags: [],
    },
    {
      name: "should identify troubleshooting",
      input:
        "how do i fix MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017",
      expected: {
        topic: "troubleshoot_debug",
      },
      tags: ["troubleshoot_debug"],
    },
    {
      name: "should identify security",
      input: "how to whitelist ips on atlas cluster",
      expected: {
        product: "atlas",
        programmingLanguage: null,
        topic: "security",
      },
      tags: [],
    },
    {
      name: "should identify voyage ai",
      input: "What does Voyage AI do",
      expected: {
        product: "voyage_ai",
      },
      tags: ["voyage_ai"],
    },
    {
      name: "should not confuse atlas vector search and voyage ai products",
      input:
        "which search similarity function should I use with voyage embeddings?",
      expected: {
        product: "voyage_ai",
      },
      tags: ["voyage_ai"],
    },
  ];

  const ProductNameCorrect: Scorer<MetadataClassifierEvalOutput, unknown> = (
    args
  ) => {
    const name = "ProductNameCorrect";
    if (args.expected?.product === undefined) {
      return {
        name,
        score: null,
      };
    }

    return {
      name: "ProductNameCorrect",
      score: args.expected?.product === args.output.product ? 1 : 0,
    };
  };

  const ProgrammingLanguageCorrect: Scorer<
    MetadataClassifierEvalOutput,
    unknown
  > = (args) => {
    const name = "ProgrammingLanguageCorrect";
    if (args.expected?.programmingLanguage === undefined) {
      return {
        name,
        score: null,
      };
    }
    return {
      name,
      score:
        args.expected?.programmingLanguage === args.output.programmingLanguage
          ? 1
          : 0,
    };
  };

  const TopicCorrect: Scorer<MetadataClassifierEvalOutput, unknown> = (
    args
  ) => {
    const name = "TopicCorrect";
    if (args.expected?.topic === undefined) {
      return {
        name,
        score: null,
      };
    }
    return {
      name,
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
    maxConcurrency: modelConfig.maxConcurrency,
    timeout: 20000,
    async task(input) {
      try {
        return await classifyMongoDbMetadata(
          wrapLanguageModel({
            model: openai.languageModel(modelLabel),
            middleware: [BraintrustMiddleware({ debug: true })],
          }),
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
