import {
  type ClassificationType,
  getEnv,
  makeClassifier,
} from "mongodb-rag-core";
import { AzureOpenAI } from "mongodb-rag-core/openai";

const env = getEnv({
  required: ["OPENAI_API_KEY", "OPENAI_ENDPOINT", "OPENAI_API_VERSION"],
});

const openAiClient = new AzureOpenAI({
  apiKey: env.OPENAI_API_KEY,
  endpoint: env.OPENAI_ENDPOINT,
  apiVersion: env.OPENAI_API_VERSION,
});

const classificationTypes: ClassificationType[] = [
  {
    type: "Advanced Features",
    description:
      "Prompts that only apply to specific use cases or complex features.",
    examples: [
      { text: "does mongodb support transactions" },
      { text: "how to use mongodump" },
      { text: "How do I backup a MongoDB database" },
      { text: "How do I use mongorestore from dump" },
      {
        text: "What's the difference between ANN and ENN search in Atlas Vector Search?",
      },
      { text: "What are mongosync limitations" },
      { text: "how to use gridfs in mongodb" },
      {
        text: "Does Atlas Vector Search work with images, media files, and other types of data?",
      },
    ],
  },
  {
    type: "AI/LLM Integration",
    description:
      "Prompts that are about MongoDB's AI/LLM integration features.",
    examples: [
      { text: "How do I build AI applications with MongoDB?" },
      {
        text: "Does MongoDB support LangGraph checkpointers? If so, are they asynchronous or synchronous?",
      },
      { text: "How does MongoDB help with AI projects?" },
      { text: "Can I use MongoDB for RAG implementations? How?" },
      { text: "Does MongoDB offer support for developing AI applications?" },
      { text: "Does MongoDB generate embeddings?" },
      { text: "What is Retrieval-augmented generation?" },
      { text: "How will MongoDB and Voyage AI work together?" },
    ],
  },
  {
    type: "Foundational Concepts",
    description: "Prompts that are about MongoDB's core features and concepts.",
    examples: [
      { text: "explain indexes in mongodb" },
      { text: "when to use findone vs find in mongodb" },
      { text: "What is a mongodb change streams example" },
      { text: "what's the difference between updateone and findoneandupdate" },
      { text: "What is the mongodb list collections command" },
      { text: "What is MongoDB?" },
      { text: "What is aggregation in MongoDB" },
      { text: "how many authentication methods for MongoDB" },
    ],
  },
  {
    type: "Positioning",
    description:
      "Prompts that position MongoDB in the market relative to other solutions.",
    examples: [
      {
        text: "What specific advantages does the new Atlas Flex tier provide over traditional serverless models?",
      },
      {
        text: "What are the key differentiators when comparing MongoDB to Azure Data Explorer (ADX)?",
      },
      { text: "How does MongoDB compare to Postgres?" },
      { text: "How is MongoDB used by companies in the energy industry?" },
      {
        text: "Are there any case studies demonstrating MongoDB’s effectiveness?",
      },
      {
        text: "How does the new pricing model of the new Atlas Flex tier ensure more predictability compared to previous offerings?",
      },
      { text: "How can I migrate from MySQL to MongoDB?" },
      { text: "What industries use MongoDB?" },
    ],
  },
  {
    type: "Practical Usage & Queries",
    description:
      "Prompts that are about how to use MongoDB in concrete scenarios.",
    examples: [
      { text: "how to get connection string from mongodb atlas" },
      { text: "command to create new collection" },
      { text: "What are the installation steps for mongodb compass" },
      { text: "What is the mongodb filter query for a nested object" },
      { text: "connect to mongodb nodejs" },
      { text: "How do you use not equal in MongoDB for multiple values" },
      { text: "how to query mongodb collection" },
      {
        text: "What are the step by step setup instructions for replication in mongodb with linux",
      },
    ],
  },
  {
    type: "Troubleshooting & Best Practices",
    description:
      "Prompts that ask about bugs, performance, and other MongoDB best practices.",
    examples: [
      { text: "What limitations for mongodb time series" },
      { text: "are there any best practices for mongodb crud operations" },
      { text: "What are the common exceptions for the mongodb java driver" },
      { text: "mongodb ttl not working" },
      { text: "How can Atlas users specify maintenance timing?" },
      {
        text: "I'm trying to use Compass with DocumentDB, and I keep running into unexpected behavior. For example, collection and database stats don't render, and I can't analyze my schema. Is there a workaround? ",
      },
      {
        text: "Why can't I read my own writes with a numbered write concern and read concern majority?",
      },
      { text: "I have enough memory, how can I further improve performance?" },
    ],
  },
  {
    type: "General Information",
    description:
      "Prompts that are related to MongoDB but not directly about the product, such as release notes, documentation, and other general information.",
    examples: [
      { text: "what's new in mongodb 8" },
      { text: "Where is the official MongoDB documentation" },
      { text: "Where are mongodb release notes" },
      { text: "Can I hire MongoDB developers to build my application?" },
      { text: "Is MongoDB currently hiring?" },
      {
        text: "Where can I find the changes in the newest version of the MongoDB Administration API?",
      },
    ],
  },
];

export const classifyCategories = makeClassifier({
  openAiClient,
  model: "gpt-4.1-mini",
  classificationTypes,
});
