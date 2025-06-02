import { z } from "zod";
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
  {
    id: "indexes",
  },
  {
    id: "billing",
  },
  {
    id: "iam",
  },
  {
    id: "change_streams",
  },
  {
    id: "time_series",
  },
  {
    id: "monitoring",
  },
  {
    id: "queries",
  },
  {
    id: "search",
  },
  {
    id: "troubleshoot_debug",
  },
  {
    id: "mongodb_university",
  },
  {
    id: "certificate_exam",
  },
  {
    id: "backup",
  },
  {
    id: "migration",
  },
  {
    id: "schema_design",
  },
  {
    id: "maintenance",
  },
] as const satisfies MongoDbTopic[];

export type MongoDbTopicId = (typeof mongoDbTopics)[number]["id"];
