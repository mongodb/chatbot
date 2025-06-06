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
    name: "Atlas Multi-Cloud Clusters",
    description:
      "Deploy a MongoDB Atlas cluster across multiple cloud providers",
  },
  {
    id: "analytics",
    name: "Analytics",
    description: "Tools and APIs for analytics operations on MongoDB",
  },
  {
    id: "security",
    name: "Security",
    description:
      "Security features like authorization, authentication, encryption, and auditing",
  },
  {
    id: "sharding",
    name: "Sharding",
    description: "Set up and manage distributed data partitions",
  },
  {
    id: "replication",
    name: "Replication",
    description: "Enable redundancy and high availability with replica sets",
  },
  {
    id: "performance",
    name: "Performance",
    description: "Diagnose slow queries and optimize database performance",
  },
  {
    id: "indexes",
    name: "Indexes",
    description: "Set up MongoDB database indexes",
  },
  {
    id: "billing",
    name: "Billing",
    description: "Examine cost and set up payments for MongoDB Atlas",
  },
  {
    id: "iam",
    name: "Identity and Access Management",
    description: "Database user authentication and authorization",
  },
  {
    id: "change_streams",
    name: "Change Streams",
    description: "Subscribe to real-time data changes in MongoDB",
  },
  {
    id: "time_series",
    name: "Time Series",
    description: "Store temporal data in Time Series Collections",
  },
  {
    id: "monitoring",
    name: "Monitoring",
    description:
      "Performance tracking, alerts, metrics, and database health monitoring",
  },
  {
    id: "queries",
    name: "Queries",
    description: "Write and edit MongoDB queries",
  },
  {
    id: "search",
    name: "Search",
    description: "MongoDB search capabilities and tools",
  },
  {
    id: "troubleshoot_debug",
    name: "Debug and Troubleshoot",
    description: "Debug code issues and provide troubleshooting guidance",
  },
  {
    id: "mongodb_university",
    name: "MongoDB University",
    description:
      "Learn about MongoDB with official courses, video lectures, and labs.",
  },
  {
    id: "certificate_exam",
    name: "Certificate Exams",
    description: "Earn MongoDB certifications by taking skill-assessment exams",
  },
  {
    id: "backup",
    name: "Backup",
    description: "Database backup and restore operations",
  },
  {
    id: "migration",
    name: "Migration",
    description: "Migrate data between databases, real-time and offline",
  },
  {
    id: "data_modeling",
    name: "Data Modeling",
    description: "Design schema models for some data",
  },
  {
    id: "maintenance",
    name: "Maintenance and Upgrades",
    description:
      "Database maintenance tasks, version upgrades, and system updates",
  },
] as const satisfies MongoDbTopic[];

export type MongoDbTopicId = (typeof mongoDbTopics)[number]["id"];
