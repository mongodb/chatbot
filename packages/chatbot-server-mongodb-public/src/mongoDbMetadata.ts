import { id } from "common-tags";
import { z } from "zod";

export const MongoDbProductSchema = z.object({
  id: z.string().describe("Unique identifier for the product"),
  name: z.string().describe("Human-friendly name of the product"),
  description: z
    .string()
    .optional()
    .describe("Brief description of the product"),
  versions: z
    .array(z.string())
    .optional()
    .describe("List of versions of the product"),
  parentProductId: z.string().optional().describe("`id` of the parent product"),
});
export type MongoDbProduct = z.infer<typeof MongoDbProductSchema>;

export const mongoDbProducts = [
  {
    id: "server",
    name: "MongoDB",
    description: "Core MongoDB server",
  },
  {
    id: "aggregation",
    name: "Aggregation Framework",
    description: "Aggregation Framework",
    parentProductId: "server",
  },
  {
    id: "atlas",
    name: "MongoDB Atlas",
    description: "MongoDB Atlas",
  },
  {
    id: "atlas_charts",
    name: "Atlas Charts",
    description: "Atlas Charts",
    parentProductId: "atlas",
  },
  {
    id: "atlas_search",
    name: "Atlas Search",
    description: "Atlas Search",
    parentProductId: "atlas",
  },
  {
    id: "atlas_vector_search",
    name: "Atlas Vector Search",
    description: "Atlas Vector Search",
    parentProductId: "atlas",
  },
  {
    id: "atlas_cli",
    name: "Atlas CLI",
    description: "CLI to interact with MongoDB Atlas",
    parentProductId: "atlas",
  },
  {
    id: "driver",
    name: "Driver",
    description: "MongoDB Drivers",
    parentProductId: "server",
  },
  {
    id: "change_streams",
    name: "Change Streams",
    description: "Change Streams",
    parentProductId: "server",
  },
  {
    id: "compass",
    name: "MongoDB Compass",
    description: "GUI tool for MongoDB",
  },
  {
    id: "gridfs",
    name: "GridFS",
    description: "GridFS",
    parentProductId: "server",
  },
  {
    id: "indexes",
    name: "Indexes",
    description: "Indexes",
    parentProductId: "server",
  },
  {
    id: "bi_connector",
    name: "MongoDB Connector for BI",
  },
  {
    id: "realm_sdk",
    name: "Realm SDK",
  },
  {
    id: "atlas_app_services",
    name: "Atlas App Services",
    parentProductId: "atlas",
  },
  {
    id: "atlas_stream_processing",
    name: "Atlas Stream Processing",
    parentProductId: "atlas",
  },
  {
    id: "atlas_triggers",
    name: "Atlas Triggers",
    parentProductId: "atlas",
  },
  {
    id: "atlas_device_sync",
    name: "Atlas Device Sync",
    parentProductId: "atlas",
  },
  {
    id: "atlas_data_api",
    name: "Atlas Data API",
    parentProductId: "atlas",
  },
  {
    id: "mongodb_ops_manager",
    name: "MongoDB Ops Manager",
  },
  {
    id: "mongodb_cloud_manager",
    name: "MongoDB Cloud Manager",
  },
] as const satisfies MongoDbProduct[];

export const MongoDBProgrammingLanguagesSchema = z.enum([
  "shell",
  "javascript",
  "typescript",
  "python",
  "java",
  "csharp",
  "cpp",
  "ruby",
  "kotlin",
  "c",
  "dart",
  "go",
  "php",
  "rust",
  "scala",
  "swift",
]);
export type MongoDbProgrammingLanguages = z.infer<
  typeof MongoDBProgrammingLanguagesSchema
>;

export const MongoDbTopicSchema = z.object({
  id: z.string().describe("Unique identifier for the topic"),
  name: z.string().describe("Human-friendly name of the topic").optional(),
  description: z.string().optional().describe("Brief description of the topic"),
});
export type MongoDbTopic = z.infer<typeof MongoDbTopicSchema>;

export const mongoDbTopics = [
  {
    id: "multi_cloud",
  },
  {
    id: "analytics",
  },
  {
    id: "security",
  },
  {
    id: "sharding",
  },
  {
    id: "replication",
  },
  {
    id: "performance",
  },
] as const satisfies MongoDbTopic[];

// Helpers for constructing the `MongoDbTag` union type
const mongoDbProductIds = mongoDbProducts.map((product) => product.id);
const mongoDbTopicIds = mongoDbTopics.map((topic) => topic.id);

/**
  All possible MongoDB tags. Useful for tagging evaluations.
  */
export type MongoDbTag =
  | MongoDbProgrammingLanguages
  | (typeof mongoDbProductIds)[number]
  | (typeof mongoDbTopicIds)[number];
