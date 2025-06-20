import { z } from "zod";
import { mongoDbProgrammingLanguageIds } from "./programmingLanguages";

export const MongoDbProductSchema = z.object({
  id: z.string().describe("Unique identifier for the product"),
  name: z.string().describe("Human-friendly name of the product"),
  description: z.string().describe("Brief description of the product"),
  programmingLanguage: z
    .enum(mongoDbProgrammingLanguageIds)
    .optional()
    .describe("The programming language used to interact with the product"),
  parentProductId: z.string().optional().describe("`id` of the parent product"),
});
export type MongoDbProduct = z.infer<typeof MongoDbProductSchema>;

/**
  Available MongoDB drivers.
 */
export const mongodbDrivers = [
  {
    id: "c_driver",
    name: "C Driver",
    description: "MongoDB C Driver",
    parentProductId: "driver",
    programmingLanguage: "c",
  },
  {
    id: "cpp_driver",
    name: "C++ Driver",
    description: "MongoDB C++ Driver",
    parentProductId: "driver",
    programmingLanguage: "cpp",
  },
  {
    id: "csharp_driver",
    name: "C# Driver",
    description: "MongoDB C# Driver",
    parentProductId: "driver",
    programmingLanguage: "csharp",
  },
  {
    id: "entity_framework_core",
    name: "MongoDB Entity Framework Provider",
    description: "MongoDB Entity Framework Core Provider",
    parentProductId: "driver",
    programmingLanguage: "csharp",
  },
  {
    id: "go_driver",
    name: "Go Driver",
    description: "MongoDB Go Driver",
    parentProductId: "driver",
    programmingLanguage: "go",
  },
  {
    id: "java_sync_driver",
    name: "Java Sync Driver",
    description: "MongoDB Java Sync Driver",
    parentProductId: "driver",
    programmingLanguage: "java",
  },
  {
    id: "java_reactive_streams_driver",
    name: "Java Reactive Streams Driver",
    description: "MongoDB Java Reactive Streams Driver",
    parentProductId: "driver",
    programmingLanguage: "java",
  },
  {
    id: "kotlin_coroutine_driver",
    name: "Kotlin Coroutine Driver",
    description: "MongoDB Kotlin Coroutine Driver",
    parentProductId: "driver",
    programmingLanguage: "kotlin",
  },
  {
    id: "kotlin_sync_driver",
    name: "Kotlin Sync Driver",
    description: "MongoDB Kotlin Sync Driver",
    parentProductId: "driver",
    programmingLanguage: "kotlin",
  },
  {
    id: "nodejs_driver",
    name: "Node.js Driver",
    description: "MongoDB Node.js Driver",
    parentProductId: "driver",
    programmingLanguage: "javascript",
  },
  {
    id: "laravel_mongodb",
    name: "Laravel MongoDB",
    description: "Laravel MongoDB integration",
    parentProductId: "driver",
    programmingLanguage: "php",
  },
  {
    id: "php_library",
    name: "PHP Library",
    description: "MongoDB PHP Library",
    parentProductId: "driver",
    programmingLanguage: "php",
  },
  {
    id: "pymongo_driver",
    name: "PyMongo",
    description: "MongoDB PyMongo Driver",
    parentProductId: "driver",
    programmingLanguage: "python",
  },
  {
    id: "pymongo_arrow_driver",
    name: "PyMongo Arrow Driver",
    description:
      "MongoDB PyMongo Arrow Driver for Apache Arrow tables, NumPy arrays, and Pandas or Polars DataFrames",
    parentProductId: "driver",
    programmingLanguage: "python",
  },
  {
    id: "ruby_driver",
    name: "Ruby Driver",
    description: "MongoDB Ruby Driver",
    parentProductId: "driver",
    programmingLanguage: "ruby",
  },
  {
    id: "mongoid_odm",
    name: "Mongoid ODM",
    description: "MongoDB Mongoid ODM for Ruby on Rails",
    parentProductId: "driver",
    programmingLanguage: "ruby",
  },
  {
    id: "rust_driver",
    name: "Rust Driver",
    description: "MongoDB Rust Driver",
    parentProductId: "driver",
    programmingLanguage: "rust",
  },
  {
    id: "scala_driver",
    name: "Scala Driver",
    description: "MongoDB Scala Driver",
    parentProductId: "driver",
    programmingLanguage: "scala",
  },
  {
    id: "swift_driver",
    name: "Swift Driver",
    description: "MongoDB Swift Driver",
    parentProductId: "driver",
    programmingLanguage: "swift",
  },
] as const satisfies MongoDbProduct[];

/**
  Available MongoDB products.
 */
export const mongoDbProducts = [
  {
    id: "server",
    name: "MongoDB Server",
    description: "Core MongoDB server",
  },
  {
    id: "aggregation",
    name: "Aggregation Framework",
    description: "Process multiple documents and return computed results",
    parentProductId: "server",
  },
  {
    id: "change_streams",
    name: "Change Streams",
    description: "Listen to changes in MongoDB data",
    parentProductId: "server",
  },
  {
    id: "driver",
    name: "MongoDB Drivers",
    description: "Client libraries for querying MongoDB",
    parentProductId: "server",
  },
  {
    id: "gridfs",
    name: "GridFS",
    description: "Store large files across multiple MongoDB documents",
    parentProductId: "server",
  },
  {
    id: "atlas",
    name: "MongoDB Atlas",
    description: "Cloud database platform-as-a-service",
  },
  {
    id: "atlas_charts",
    name: "Atlas Charts",
    description: "Visualize data stored in MongoDB Atlas",
    parentProductId: "atlas",
  },
  {
    id: "atlas_search",
    name: "Atlas Search",
    description: "Full-text search on your data in MongoDB Atlas",
    parentProductId: "atlas",
  },
  {
    id: "atlas_vector_search",
    name: "Atlas Vector Search",
    description: "Vector search on your data in MongoDB Atlas",
    parentProductId: "atlas",
  },
  {
    id: "data_federation",
    name: "Atlas Data Federation",
    description:
      "Query data across multiple MongoDB databases and cloud object stores",
    parentProductId: "atlas",
  },
  {
    id: "atlas_cli",
    name: "Atlas CLI",
    description: "CLI to interact with MongoDB Atlas",
    parentProductId: "atlas",
  },
  {
    id: "atlas_online_archive",
    name: "Atlas Online Archive",
    description: "Archive infrequently accessed data in MongoDB Atlas.",
    parentProductId: "atlas",
  },
  {
    id: "atlas_stream_processing",
    name: "Atlas Stream Processing",
    parentProductId: "atlas",
    description: "Real-time data processing with MongoDB Atlas",
  },
  {
    id: "atlas_triggers",
    name: "Atlas Triggers",
    parentProductId: "atlas",
    description:
      "Managed service that runs actions in response to events on MongoDB Atlas",
  },
  {
    id: "atlas_operator",
    name: "MongoDB Atlas Kubernetes Operator",
    parentProductId: "atlas",
    description:
      "Manage Atlas resources (clusters, projects, database users) directly within a Kubernetes cluster.",
  },
  {
    id: "atlas_gov",
    name: "MongoDB Atlas for Government",
    description: "MongoDB Atlas for Government",
    parentProductId: "atlas",
  },
  {
    id: "atlas_performance_advisor",
    name: "Performance Advisor",
    description:
      "Monitors slow queries and makes suggestions on how to improve query performance",
    parentProductId: "atlas",
  },
  {
    id: "bi_connector",
    name: "MongoDB Connector for BI",
    description:
      "Query MongoDB data with SQL using business intelligence tools.",
  },
  {
    id: "compass",
    name: "MongoDB Compass",
    description: "GUI tool for MongoDB",
  },
  {
    id: "mongodb_ops_manager",
    name: "MongoDB Ops Manager",
    description: "On-prem management tool for MongoDB",
  },
  {
    id: "mongodb_cloud_manager",
    name: "MongoDB Cloud Manager",
    description: "Self-hosted management tool for MongoDB in the cloud",
  },
  {
    id: "spark_connector",
    name: "MongoDB Spark Connector",
    description: "MongoDB Connector for Apache Spark",
  },
  {
    id: "shell",
    name: "MongoDB Shell",
    description:
      "The MongoDB Shell, mongosh, is a JavaScript and Node.js REPL for interacting with MongoDB databases.",
  },
  {
    id: "mongodb_vscode",
    name: "MongoDB for VS Code",
    description:
      "VS Code extension for working with MongoDB data directly in your IDE",
  },
  {
    id: "mcp_server",
    name: "MongoDB MCP Server",
    description:
      "The MongoDB MCP Server lets you connect to MongoDB from your agentic AI tools, assistants, and platforms.",
  },
  {
    id: "mongodb_cli",
    name: "MongoDB CLI",
    description: "CLI for interacting with MongoDB deployments",
  },
  {
    id: "database_tools",
    name: "MongoDB Database Tools",
    description:
      "Command-line utilities for MongoDB data migration, backups, and restores",
  },
  {
    id: "mongodb_analyzer",
    name: "C# Analyzer",
    description: "VS Code extension for analysing MongoDB .NET/C# driver code",
  },
  {
    id: "intellij",
    name: "MongoDB IntelliJ Plugin",
    description: "IntelliJ plugin for MongoDB development in Java",
  },
  {
    id: "kafka_connector",
    name: "MongoDB Kafka Connector",
    description: "MongoDB Kafka Connector",
  },
  {
    id: "django",
    name: "Django MongoDB Backend",
    description: "Interact with a MongoDB deployment from Django",
  },
  {
    id: "cluster_sync",
    name: "Cluster-to-Cluster Sync",
    description: "Sync data between MongoDB clusters",
  },
  {
    id: "community_kubernetes_operator",
    name: "Community Kubernetes Operator",
    description:
      "[Deprecated] Deploy basic MongoDB ReplicaSets on Kubernetes, open-source and free.",
  },
  {
    id: "enterprise_kubernetes_operator",
    name: "Kubernetes Operator",
    description:
      "[Deprecated] Deploy production MongoDB clusters with greater features, requires commercial license.",
  },
  {
    id: "mongodb_kubernetes_controllers",
    name: "MongoDB Controllers for Kubernetes",
    description:
      "MongoDB Kubernetes Operator provisions storage, networking, and users and integrates with Cloud/Ops Manager.",
  },
  {
    id: "relational_migrator",
    name: "MongoDB Relational Migrator",
    description: "Migrates data from relational databases to MongoDB",
  },
  {
    id: "mongodb_university",
    name: "MongoDB University",
    description:
      "Online platform that offers certifications, courses, labs, and skills badges",
  },
  {
    id: "skills",
    name: "MongoDB University Skills",
    description:
      "Earn a skill badge after taking a short course and completing an assessment",
  },
] as const satisfies MongoDbProduct[];

export type MongoDbProductName = (typeof mongoDbProducts)[number]["name"];
export type MongoDbDriverName = (typeof mongodbDrivers)[number]["name"];
export type MongoDbProductId = (typeof mongoDbProducts)[number]["id"];
export type MongoDbProductNameEnum = [
  MongoDbProductName,
  ...MongoDbProductName[]
];
export const mongoDbProductNames = mongoDbProducts.map(
  (prod) => prod.name
) as MongoDbProductNameEnum;
