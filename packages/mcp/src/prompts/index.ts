import { Prompt } from "../types";

/**
 * MongoDB-specific prompts for the MCP server
 *
 * These prompts help LLMs generate accurate MongoDB queries, aggregations, and other operations.
 */

/**
 * Prompt for generating MongoDB queries from natural language descriptions
 */
export const mongoDbQueryPrompt: Prompt = {
  name: "mongodb_query",
  description:
    "Generate a MongoDB query based on a natural language description",
  template: `You are a MongoDB query generator. Your task is to convert a natural language description into a valid MongoDB query.

# Context
{{#if collection}}This query will be executed against the '{{collection}}' collection.{{/if}}
{{#if schema}}The collection has the following schema:

\`\`\`json
{{schema}}
\`\`\`{{/if}}

# Description
{{description}}

# Instructions
1. Generate a MongoDB query in JSON format that accomplishes this task
2. The query should be formatted as a proper MongoDB query object
3. Use appropriate MongoDB operators ($eq, $gt, $lt, etc.) when necessary
4. If the query requires sorting, include a sort parameter
5. If the query should limit results, include a limit parameter

# Output
Provide ONLY the MongoDB query as a valid JSON object, without any explanation or additional text.`,
  parameters: {
    type: "object",
    properties: {
      description: {
        type: "string",
        description: "Natural language description of the query to generate",
      },
      collection: {
        type: "string",
        description: "Optional. The name of the collection being queried",
      },
      schema: {
        type: "string",
        description: "Optional. JSON schema of the collection",
      },
    },
    required: ["description"],
  },
};

/**
 * Prompt for generating MongoDB aggregation pipelines from natural language descriptions
 */
export const mongoDbAggregationPrompt: Prompt = {
  name: "mongodb_aggregation",
  description:
    "Generate a MongoDB aggregation pipeline based on a natural language description",
  template: `You are a MongoDB aggregation pipeline generator. Your task is to convert a natural language description into a valid MongoDB aggregation pipeline.

# Context
{{#if collection}}This aggregation will be executed against the '{{collection}}' collection.{{/if}}
{{#if schema}}The collection has the following schema:

\`\`\`json
{{schema}}
\`\`\`{{/if}}

# Description
{{description}}

# Instructions
1. Generate a MongoDB aggregation pipeline that accomplishes this task
2. The pipeline should be an array of stages in the correct order
3. Use appropriate MongoDB aggregation operators ($match, $group, $project, etc.)
4. Ensure each stage is properly formatted as a MongoDB aggregation stage
5. If the aggregation requires sorting, include a $sort stage
6. If the aggregation should limit results, include a $limit stage

# Output
Provide ONLY the MongoDB aggregation pipeline as a valid JSON array, without any explanation or additional text.`,
  parameters: {
    type: "object",
    properties: {
      description: {
        type: "string",
        description:
          "Natural language description of the aggregation to generate",
      },
      collection: {
        type: "string",
        description: "Optional. The name of the collection being aggregated",
      },
      schema: {
        type: "string",
        description: "Optional. JSON schema of the collection",
      },
    },
    required: ["description"],
  },
};

/**
 * Prompt for generating MongoDB update operations from natural language descriptions
 */
export const mongoDbUpdatePrompt: Prompt = {
  name: "mongodb_update",
  description:
    "Generate a MongoDB update operation based on a natural language description",
  template: `You are a MongoDB update operation generator. Your task is to convert a natural language description into a valid MongoDB update operation.

# Context
{{#if collection}}This update will be executed against the '{{collection}}' collection.{{/if}}
{{#if schema}}The collection has the following schema:

\`\`\`json
{{schema}}
\`\`\`{{/if}}

# Description
{{description}}

# Instructions
1. Generate a MongoDB update operation that accomplishes this task
2. Provide both the filter (to identify documents to update) and the update operation
3. Use appropriate MongoDB update operators ($set, $unset, $inc, etc.)
4. Consider whether this should be a single update or multi-update
5. Consider whether this should be an upsert operation

# Output
Provide the MongoDB update as a valid JSON object with 'filter' and 'update' properties, and optionally 'options' for multi/upsert settings.`,
  parameters: {
    type: "object",
    properties: {
      description: {
        type: "string",
        description:
          "Natural language description of the update operation to generate",
      },
      collection: {
        type: "string",
        description: "Optional. The name of the collection being updated",
      },
      schema: {
        type: "string",
        description: "Optional. JSON schema of the collection",
      },
    },
    required: ["description"],
  },
};

/**
 * Prompt for generating MongoDB schema designs from requirements
 */
export const mongoDbSchemaDesignPrompt: Prompt = {
  name: "mongodb_schema_design",
  description: "Generate a MongoDB schema design based on requirements",
  template: `You are a MongoDB schema designer. Your task is to design a MongoDB schema based on the given requirements.

# Requirements
{{requirements}}

# Instructions
1. Design a MongoDB schema that meets these requirements
2. Consider MongoDB best practices for schema design:
   - Embedding vs. referencing documents
   - Denormalization when appropriate
   - Indexing for common queries
   - Schema validation rules
3. Provide a JSON Schema representation for each collection
4. Include sample documents to illustrate the schema
5. Explain your design decisions and trade-offs

# Output
Provide a complete MongoDB schema design with collection definitions, relationships, indexes, and sample documents.`,
  parameters: {
    type: "object",
    properties: {
      requirements: {
        type: "string",
        description: "Requirements for the MongoDB schema design",
      },
    },
    required: ["requirements"],
  },
};

/**
 * Prompt for generating MongoDB index recommendations
 */
export const mongoDbIndexRecommendationPrompt: Prompt = {
  name: "mongodb_index_recommendation",
  description: "Generate MongoDB index recommendations based on query patterns",
  template: `You are a MongoDB performance expert. Your task is to recommend indexes based on the given query patterns.

# Context
{{#if collection}}These queries will be executed against the '{{collection}}' collection.{{/if}}
{{#if schema}}The collection has the following schema:

\`\`\`json
{{schema}}
\`\`\`{{/if}}

# Query Patterns
{{queryPatterns}}

# Instructions
1. Analyze the query patterns to identify fields that should be indexed
2. Recommend appropriate indexes (single-field, compound, text, etc.)
3. Consider the order of fields in compound indexes
4. Consider the impact of indexes on write performance
5. Suggest index options when appropriate (unique, sparse, etc.)

# Output
Provide MongoDB index creation commands for each recommended index, along with explanations of why each index is beneficial.`,
  parameters: {
    type: "object",
    properties: {
      queryPatterns: {
        type: "string",
        description: "Description of common query patterns",
      },
      collection: {
        type: "string",
        description: "Optional. The name of the collection",
      },
      schema: {
        type: "string",
        description: "Optional. JSON schema of the collection",
      },
    },
    required: ["queryPatterns"],
  },
};

// Export prompt handler and service
export * from "./promptHandler";
export * from "./promptService";
