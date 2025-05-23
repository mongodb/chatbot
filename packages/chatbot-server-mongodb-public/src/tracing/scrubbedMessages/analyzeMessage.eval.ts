import "dotenv/config";
import { analyzeMessage, MessageAnalysis } from "./analyzeMessage";
import { Eval } from "mongodb-rag-core/braintrust";
import { Scorer } from "autoevals";
import { azureOpenAiProvider } from "../../eval/evalHelpers";
import { assertEnvVars } from "mongodb-rag-core";
import { ANALYZER_ENV_VARS } from "../../EnvVars";

interface AnalyzeMessageEvalCase {
  input: string;
  expected: MessageAnalysis;
}

const evalCases: AnalyzeMessageEvalCase[] = [
  {
    input: "How do I create a new cluster in Atlas?",
    expected: {
      topics: ["atlas"],
      relevance: 1,
      keywords: ["create", "cluster", "Atlas"],
      sentiment: "Informational/Technical",
    },
  },
  {
    input: "How do I create a compound index in MongoDB?",
    expected: {
      topics: ["indexes"],
      relevance: 1,
      keywords: ["compound index", "create", "MongoDB"],
      sentiment: "Informational/Technical",
    },
  },
  {
    input: "How do I connect to MongoDB using the Node.js driver?",
    expected: {
      topics: ["drivers"],
      relevance: 1,
      keywords: ["connect", "Node.js", "driver"],
      sentiment: "Informational/Technical",
    },
  },
  {
    input: "How do I use the $match stage in an aggregation pipeline?",
    expected: {
      topics: ["aggregation"],
      relevance: 1,
      keywords: ["$match", "stage", "aggregation pipeline"],
      sentiment: "Informational/Technical",
    },
  },
  {
    input: "What's the best recipe for chocolate chip cookies?",
    expected: {
      topics: null,
      relevance: 0,
      keywords: ["recipe", "chocolate chip cookies"],
      sentiment: "Off-topic",
    },
  },
  {
    input: "Why am I getting a connection error with my MongoDB Atlas cluster?",
    expected: {
      topics: ["atlas", "connection"],
      sentiment: "Troubleshooting",
      relevance: 1,
      keywords: ["connection error", "Atlas cluster"],
    },
  },
  {
    input: "How do I implement vector search in MongoDB Atlas?",
    expected: {
      topics: ["atlas_vector_search"],
      relevance: 1,
      keywords: ["vector search", "implement", "Atlas"],
      sentiment: "Informational/Technical",
    },
  },
  {
    input: "How does MongoDB compare to PostgreSQL for my web application?",
    expected: {
      relevance: 0.7,
      topics: null,
      keywords: ["compare", "PostgreSQL", "web application"],
      sentiment: "Comparative/Evaluative",
    },
  },
  {
    input: "How do I set up role-based access control in MongoDB?",
    expected: {
      topics: ["security"],
      relevance: 1,
      keywords: ["role-based access control", "RBAC", "security"],
      sentiment: "Informational/Technical",
    },
  },
  {
    input:
      "What's the best schema design for a social media application in MongoDB?",
    expected: {
      topics: ["schema_design"],
      relevance: 1,
      keywords: ["schema design", "social media", "application"],
      sentiment: "Architectural/Design",
    },
  },
];

const TopicsCorrect: Scorer<MessageAnalysis, unknown> = (args) => {
  // If expected topics is defined, check if all expected topics are included in output
  if (args.expected?.topics && args.output.topics) {
    const allTopicsIncluded = args.expected.topics.every((topic) =>
      args.output.topics?.includes(topic)
    );
    return {
      name: "TopicsCorrect",
      score: allTopicsIncluded ? 1 : 0,
    };
  }

  // Default case
  return {
    name: "TopicsCorrect",
    score: 0,
  };
};

const RelevanceCorrect: Scorer<MessageAnalysis, unknown> = (args) => {
  if (args.expected?.relevance === undefined) {
    return {
      name: "RelevanceCorrect",
      score: null, // Skip this check if relevance isn't specified in expected
    };
  }

  const difference = Math.abs(args.expected.relevance - args.output.relevance);

  return {
    name: "RelevanceCorrect",
    score: 1 - difference,
  };
};

const { OPENAI_ANALYZER_CHAT_COMPLETION_DEPLOYMENT: model } = assertEnvVars({
  ...ANALYZER_ENV_VARS,
});

Eval("analyze-message", {
  data: evalCases,
  experimentName: model,
  metadata: {
    description:
      "Evaluates whether the message analyzer correctly identifies topics, sentiment, and relevance.",
    model,
  },
  maxConcurrency: 5,
  timeout: 30000,
  async task(input) {
    try {
      return await analyzeMessage(input, azureOpenAiProvider(model));
    } catch (error) {
      console.log(`Error evaluating input: ${input}`);
      console.log(error);
      throw error;
    }
  },
  scores: [TopicsCorrect, RelevanceCorrect],
});
