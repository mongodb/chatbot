import { z } from "zod";

// TODO: i'm not sure what should be put in here
// Would defer to Nellie on details
export const ClusterConfigSchema = z.object({
  cloudProvider: z.enum(["aws", "azure", "gcp"]).default("aws"),
  region: z.string().optional().default("us-east-1"),
  instanceType: z.string(),
});

export const ClusterBuilderConversationEvalCaseSchema = z.object({
  name: z
    .string()
    .describe(
      "Name of the eval case. Useful for providing a high-level description of what the eval case assesses."
    ),
  messages: z
    .array(
      z.object({
        role: z.enum(["assistant", "user", "system"]),
        content: z.string(),
      })
    )
    .min(1)
    .describe("Input messages to the AI for the eval case"),
  currentClusterConfig: ClusterConfigSchema.optional()
    .nullable()
    .describe("Current cluster configuration. Null if no cluster exists"),
  // NOTE: we can define a finite set of tags to apply to the eval case, if that'd be useful for filtering.
  tags: z.array(z.string()).optional().describe("Tags for the eval case"),
  skip: z.boolean().optional().describe("Skip this eval case"),
  reject: z
    .boolean()
    .optional()
    .describe("The system should reject this message"),
  expectedLinks: z
    .array(z.string())
    .optional()
    .describe("Links to relevant sources"),
  referenceAnswer: z
    .string()
    .optional()
    .describe("Reference answer for model to output"),
  expectedClusterConfig: ClusterConfigSchema.optional()
    .nullable()
    .describe(
      "Expected cluster configuration. Null if no cluster config is expected"
    ),
  additionalNotes: z
    .string()
    .optional()
    .describe("Additional notes for the eval case"),
});

export type ClusterBuilderConversationEvalCase = z.infer<
  typeof ClusterBuilderConversationEvalCaseSchema
>;

// Some example eval cases. Showing the gist of what to do. Feel free to add/edit/delete as you see fit.
export const exampleClusterBuilderConversationEvalCases: ClusterBuilderConversationEvalCase[] =
  [
    // Most basic example
    {
      name: "should recommend m0 for simple, toy application",
      messages: [
        {
          role: "user",
          content:
            "I want to build a simple, toy application to understand how to use MongoDB well",
        },
      ],
      expectedClusterConfig: {
        cloudProvider: "aws",
        region: "us-east-1",
        instanceType: "m0",
      },
      tags: ["simple", "m0"],
    },
    // Example with reference answer
    {
      name: "should recommend m30 for production high-traffic application",
      messages: [
        {
          role: "user",
          content:
            "I'm building a production e-commerce application that will handle thousands of concurrent users and millions of transactions per day",
        },
      ],
      referenceAnswer: `For a production e-commerce application handling thousands of concurrent users and millions of daily transactions, I recommend an **M30 cluster** on AWS. This tier provides dedicated resources with 8 GB RAM and 2 vCPUs, ensuring reliable performance under heavy load. The M30 tier also includes automated backups, point-in-time recovery, and enhanced security features essential for production workloads.`,
      expectedClusterConfig: {
        cloudProvider: "aws",
        region: "us-east-1",
        instanceType: "m30",
      },
      tags: ["production", "high-traffic", "m30"],
    },
    // Multi-turn
    {
      name: "should recommend m0 for development environment (multi-turn)",
      messages: [
        {
          role: "user",
          content:
            "I need a MongoDB cluster for my development and testing environment.",
        },
        {
          role: "assistant",
          content: "what are your cost constraints?",
        },
        {
          role: "user",
          content:
            "Cost is a concern since this won't be handling production traffic",
        },
      ],
      expectedClusterConfig: {
        cloudProvider: "aws",
        region: "us-east-1",
        instanceType: "m0",
      },
      tags: ["development", "testing", "cost-effective", "m0"],
    },
    // With existing cluster
    {
      name: "should recommend cluster modification",
      messages: [
        {
          role: "user",
          content: "Upgrade my cluster from m0 to m10",
        },
      ],
      currentClusterConfig: {
        cloudProvider: "aws",
        region: "us-east-1",
        instanceType: "m0",
      },
      expectedClusterConfig: {
        cloudProvider: "aws",
        region: "us-east-1",
        instanceType: "m10",
      },
      tags: ["upgrade", "current-cluster"],
    },
    {
      name: "should recommend Azure for enterprise with Azure requirement",
      messages: [
        {
          role: "user",
          content:
            "Our enterprise requires all infrastructure to be deployed on Microsoft Azure. We need a cluster for our customer management application",
        },
      ],
      expectedClusterConfig: {
        cloudProvider: "azure",
        region: "us-east-1",
        instanceType: "m10",
      },
      tags: ["enterprise", "azure", "m10"],
    },
    {
      name: "should recommend m2 for budget-conscious startup",
      messages: [
        {
          role: "user",
          content:
            "I'm a startup founder with limited budget. Need a cluster for my MVP application that can handle a few hundred users initially",
        },
      ],
      expectedClusterConfig: {
        cloudProvider: "aws",
        region: "us-east-1",
        instanceType: "m2",
      },
      tags: ["startup", "budget", "mvp", "m2"],
    },

    {
      name: "should recommend m10 for machine learning workload",
      messages: [
        {
          role: "user",
          content:
            "I need a MongoDB cluster to store training data and model results for my machine learning pipeline. The workload involves complex aggregations and analytics at a relatively small scale",
        },
      ],
      expectedClusterConfig: {
        cloudProvider: "aws",
        region: "us-east-1",
        instanceType: "m10",
      },
      tags: ["machine-learning", "analytics", "aggregations", "m10"],
    },
  ];
