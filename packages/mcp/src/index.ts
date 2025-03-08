/**
 * MongoDB MCP Server
 *
 * This server implements the Model Context Protocol (MCP) for MongoDB,
 * allowing LLMs to interact with MongoDB databases and resources.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { connectToMongoDB, closeMongoDB } from "./utils/mongodb";
import { registerMongoDbTools } from "./tools";

/**
 * Initialize and start the MCP server
 */
async function startServer() {
  try {
    // Connect to MongoDB
    await connectToMongoDB();

    // Create MCP server
    const server = new McpServer({
      name: "mongodb-mcp-server",
      version: "0.1.0",
      description: "MCP server for MongoDB databases and resources",
    });

    // Register MongoDB tools
    registerMongoDbTools(server);

    // MongoDB Query prompt
    server.prompt(
      "mongodb_query",
      {
        description: z.string(),
        collection: z.string().optional(),
        schema: z.string().optional(),
      },
      (params) => ({
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: renderMongoDbQueryPrompt(params),
            },
          },
        ],
      })
    );

    // MongoDB Aggregation prompt
    server.prompt(
      "mongodb_aggregation",
      {
        description: z.string(),
        collection: z.string().optional(),
        schema: z.string().optional(),
        sampleData: z.string().optional(),
      },
      (params) => ({
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: renderMongoDbAggregationPrompt(params),
            },
          },
        ],
      })
    );

    // MongoDB Update prompt
    server.prompt(
      "mongodb_update",
      {
        description: z.string(),
        collection: z.string().optional(),
        schema: z.string().optional(),
      },
      (params) => ({
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: renderMongoDbUpdatePrompt(params),
            },
          },
        ],
      })
    );

    // MongoDB Schema Design prompt
    server.prompt(
      "mongodb_schema_design",
      {
        description: z.string(),
        requirements: z.string().optional(),
        existingSchemas: z.string().optional(),
      },
      (params) => ({
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: renderMongoDbSchemaDesignPrompt(params),
            },
          },
        ],
      })
    );

    // MongoDB Index Recommendation prompt
    server.prompt(
      "mongodb_index_recommendation",
      {
        description: z.string(),
        collection: z.string().optional(),
        schema: z.string().optional(),
        queryPatterns: z.string().optional(),
      },
      (params) => ({
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: renderMongoDbIndexRecommendationPrompt(params),
            },
          },
        ],
      })
    );

    // Example resource
    server.resource("mongodb_info", "mongodb://info", async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: "MongoDB is a document database with the scalability and flexibility that you want with the querying and indexing that you need.",
        },
      ],
    }));

    // Start the server with stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.log("MongoDB MCP server is running");

    // Handle process termination
    process.on("SIGINT", async () => {
      console.log("Shutting down MongoDB MCP server...");
      await closeMongoDB();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      console.log("Shutting down MongoDB MCP server...");
      await closeMongoDB();
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to start MCP server:", error);
    process.exit(1);
  }
}

// Helper functions to render prompts
function renderMongoDbQueryPrompt(params: any): string {
  const { description, collection, schema } = params;
  let prompt = `You are a MongoDB query generator. Your task is to convert a natural language description into a valid MongoDB query.\n\n`;

  prompt += `# Context\n`;
  if (collection) {
    prompt += `This query will be executed against the '${collection}' collection.\n`;
  }

  if (schema) {
    prompt += `The collection has the following schema:\n\n\`\`\`json\n${schema}\n\`\`\`\n`;
  }

  prompt += `\n# Description\n${description}\n\n`;

  prompt += `# Instructions\n`;
  prompt += `1. Generate a MongoDB query in JSON format that accomplishes this task\n`;
  prompt += `2. The query should be formatted as a proper MongoDB query object\n`;
  prompt += `3. Use appropriate MongoDB operators ($eq, $gt, $lt, etc.) when necessary\n`;
  prompt += `4. If the query requires sorting, include a sort parameter\n`;
  prompt += `5. If the query should limit results, include a limit parameter\n\n`;

  prompt += `# Output\n`;
  prompt += `Provide ONLY the MongoDB query as a valid JSON object, without any explanation or additional text.`;

  return prompt;
}

function renderMongoDbAggregationPrompt(params: any): string {
  const { description, collection, schema, sampleData } = params;
  let prompt = `You are a MongoDB aggregation pipeline generator. Your task is to convert a natural language description into a valid MongoDB aggregation pipeline.\n\n`;

  prompt += `# Context\n`;
  if (collection) {
    prompt += `This aggregation will be executed against the '${collection}' collection.\n`;
  }

  if (schema) {
    prompt += `The collection has the following schema:\n\n\`\`\`json\n${schema}\n\`\`\`\n`;
  }

  if (sampleData) {
    prompt += `Here is some sample data from the collection:\n\n\`\`\`json\n${sampleData}\n\`\`\`\n`;
  }

  prompt += `\n# Description\n${description}\n\n`;

  prompt += `# Instructions\n`;
  prompt += `1. Generate a MongoDB aggregation pipeline that accomplishes this task\n`;
  prompt += `2. The pipeline should be an array of stages in the correct order\n`;
  prompt += `3. Use appropriate MongoDB aggregation operators ($match, $group, $project, etc.)\n`;
  prompt += `4. Ensure the pipeline is optimized for performance\n\n`;

  prompt += `# Output\n`;
  prompt += `Provide ONLY the MongoDB aggregation pipeline as a valid JSON array, without any explanation or additional text.`;

  return prompt;
}

function renderMongoDbUpdatePrompt(params: any): string {
  const { description, collection, schema } = params;
  let prompt = `You are a MongoDB update operation generator. Your task is to convert a natural language description into a valid MongoDB update operation.\n\n`;

  prompt += `# Context\n`;
  if (collection) {
    prompt += `This update will be executed against the '${collection}' collection.\n`;
  }

  if (schema) {
    prompt += `The collection has the following schema:\n\n\`\`\`json\n${schema}\n\`\`\`\n`;
  }

  prompt += `\n# Description\n${description}\n\n`;

  prompt += `# Instructions\n`;
  prompt += `1. Generate a MongoDB update operation that accomplishes this task\n`;
  prompt += `2. Include both the filter (to select documents) and the update operations\n`;
  prompt += `3. Use appropriate MongoDB update operators ($set, $inc, $push, etc.)\n`;
  prompt += `4. If needed, specify options like 'upsert' or 'multi'\n\n`;

  prompt += `# Output\n`;
  prompt += `Provide the MongoDB update as a valid JSON object with 'filter' and 'update' properties, and optionally 'options' for multi/upsert settings.`;

  return prompt;
}

function renderMongoDbSchemaDesignPrompt(params: any): string {
  const { description, requirements, existingSchemas } = params;
  let prompt = `You are a MongoDB schema design expert. Your task is to design an optimal schema based on the requirements.\n\n`;

  prompt += `# Context\n`;
  if (existingSchemas) {
    prompt += `Here are existing schemas in the database that may be related:\n\n\`\`\`json\n${existingSchemas}\n\`\`\`\n`;
  }

  prompt += `\n# Description\n${description}\n\n`;

  if (requirements) {
    prompt += `# Requirements\n${requirements}\n\n`;
  }

  prompt += `# Instructions\n`;
  prompt += `1. Design a MongoDB schema that meets the requirements\n`;
  prompt += `2. Follow MongoDB best practices for schema design\n`;
  prompt += `3. Consider embedding vs. referencing based on the access patterns\n`;
  prompt += `4. Include appropriate data types, validation rules, and indexes\n`;
  prompt += `5. Explain your design decisions\n\n`;

  prompt += `# Output\n`;
  prompt += `Provide the MongoDB schema in JSON Schema format, along with a brief explanation of your design decisions.`;

  return prompt;
}

function renderMongoDbIndexRecommendationPrompt(params: any): string {
  const { description, collection, schema, queryPatterns } = params;
  let prompt = `You are a MongoDB index optimization expert. Your task is to recommend appropriate indexes based on the query patterns.\n\n`;

  prompt += `# Context\n`;
  if (collection) {
    prompt += `These indexes will be created for the '${collection}' collection.\n`;
  }

  if (schema) {
    prompt += `The collection has the following schema:\n\n\`\`\`json\n${schema}\n\`\`\`\n`;
  }

  if (queryPatterns) {
    prompt += `The collection is queried with the following patterns:\n\n${queryPatterns}\n`;
  }

  prompt += `\n# Description\n${description}\n\n`;

  prompt += `# Instructions\n`;
  prompt += `1. Recommend appropriate indexes for the given query patterns\n`;
  prompt += `2. Consider the trade-offs between query performance and write performance\n`;
  prompt += `3. Specify index types (single-field, compound, text, etc.)\n`;
  prompt += `4. Include index options if necessary (sparse, unique, etc.)\n`;
  prompt += `5. Explain the reasoning behind each recommended index\n\n`;

  prompt += `# Output\n`;
  prompt += `Provide the MongoDB createIndex() commands for each recommended index, along with a brief explanation of why each index is beneficial.`;

  return prompt;
}

// Start the server
startServer();
