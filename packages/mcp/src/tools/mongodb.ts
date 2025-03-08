/**
 * MongoDB Tools
 *
 * This module provides MCP tools for interacting with MongoDB databases.
 */

import { z } from "zod";
import { executeMongoOperation } from "../utils/mongodb";

/**
 * Execute a MongoDB query
 */
export async function executeQuery(params: {
  collection: string;
  query: string;
}) {
  try {
    const { collection, query } = params;

    // Parse the query JSON
    const queryObj = JSON.parse(query);

    // Execute the query
    const result = await executeMongoOperation(async (db) => {
      const coll = db.collection(collection);
      return await coll.find(queryObj).limit(100).toArray();
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error: unknown) {
    console.error("Error executing MongoDB query:", error);
    return {
      content: [
        {
          type: "text" as const,
          text: `Error executing query: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
    };
  }
}

/**
 * Execute a MongoDB aggregation pipeline
 */
export async function executeAggregation(params: {
  collection: string;
  pipeline: string;
}) {
  try {
    const { collection, pipeline } = params;

    // Parse the pipeline JSON
    const pipelineArray = JSON.parse(pipeline);

    // Execute the aggregation
    const result = await executeMongoOperation(async (db) => {
      const coll = db.collection(collection);
      return await coll.aggregate(pipelineArray).limit(100).toArray();
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error: unknown) {
    console.error("Error executing MongoDB aggregation:", error);
    return {
      content: [
        {
          type: "text" as const,
          text: `Error executing aggregation: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
    };
  }
}

/**
 * Execute a MongoDB update operation
 */
export async function executeUpdate(params: {
  collection: string;
  filter: string;
  update: string;
  options?: string;
}) {
  try {
    const { collection, filter, update, options } = params;

    // Parse the JSON parameters
    const filterObj = JSON.parse(filter);
    const updateObj = JSON.parse(update);
    const optionsObj = options ? JSON.parse(options) : {};

    // Execute the update
    const result = await executeMongoOperation(async (db) => {
      const coll = db.collection(collection);
      if (optionsObj.multi) {
        return await coll.updateMany(filterObj, updateObj, optionsObj);
      } else {
        return await coll.updateOne(filterObj, updateObj, optionsObj);
      }
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error: unknown) {
    console.error("Error executing MongoDB update:", error);
    return {
      content: [
        {
          type: "text" as const,
          text: `Error executing update: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
    };
  }
}

/**
 * Get MongoDB database information
 */
export async function getDatabaseInfo() {
  try {
    const result = await executeMongoOperation(async (db) => {
      // Get list of collections
      const collections = await db.listCollections().toArray();

      // Get database stats
      const stats = await db.stats();

      return {
        databaseName: db.databaseName,
        collections: collections.map((c) => c.name),
        stats,
      };
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error: unknown) {
    console.error("Error getting database info:", error);
    return {
      content: [
        {
          type: "text" as const,
          text: `Error getting database info: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
    };
  }
}

/**
 * Get collection schema
 */
export async function getCollectionSchema(params: { collection: string }) {
  try {
    const { collection } = params;

    const result = await executeMongoOperation(async (db) => {
      const coll = db.collection(collection);

      // Sample documents to infer schema
      const sampleDocs = await coll.find().limit(10).toArray();

      // Infer schema from sample documents
      const schema = inferSchema(sampleDocs);

      return {
        collection,
        documentCount: await coll.countDocuments(),
        schema,
      };
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error: unknown) {
    console.error("Error getting collection schema:", error);
    return {
      content: [
        {
          type: "text" as const,
          text: `Error getting collection schema: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
    };
  }
}

/**
 * Helper function to infer schema from documents
 */
function inferSchema(documents: any[]): Record<string, string> {
  if (!documents || documents.length === 0) {
    return {};
  }

  const schema: Record<string, Set<string>> = {};

  // Analyze each document
  for (const doc of documents) {
    for (const [key, value] of Object.entries(doc)) {
      if (!schema[key]) {
        schema[key] = new Set();
      }

      if (value === null) {
        schema[key].add("null");
      } else if (Array.isArray(value)) {
        schema[key].add("array");
      } else {
        schema[key].add(typeof value);
      }
    }
  }

  // Convert sets to strings
  const result: Record<string, string> = {};
  for (const [key, types] of Object.entries(schema)) {
    result[key] = Array.from(types).join(" | ");
  }

  return result;
}

/**
 * Execute any MongoDB operation as a string
 */
export async function executeGenericQuery(params: {
  query: string;
  limit?: number;
}) {
  try {
    const { query, limit = 10 } = params;
    console.log(`[MCP MongoDB] Executing query: ${query} with limit: ${limit}`);

    // Execute the query
    const result = await executeMongoOperation(async (db) => {
      console.log(`[MCP MongoDB] Connected to database: ${db.databaseName}`);
      // Evaluate the query in the context of the database
      // This is a simplified approach - in production, you'd want more security
      const asyncFunction = new Function(
        "db",
        "limit",
        `
        return (async () => {
          try {
            console.log('[MCP MongoDB] Starting query execution');
            const result = await ${query}; 
            // Handle cursor results by converting to array with limit
            if (result && typeof result.toArray === 'function') {
              console.log('[MCP MongoDB] Converting cursor to array with limit: ' + limit);
              return await result.limit(limit).toArray();
            }
            console.log('[MCP MongoDB] Query executed successfully');
            return result;
          } catch (err) {
            console.error('[MCP MongoDB] Error in query execution:', err);
            throw err;
          }
        })();
      `
      );

      return await asyncFunction(db, limit);
    });

    console.log(
      `[MCP MongoDB] Query result: ${JSON.stringify(result).substring(0, 100)}${
        JSON.stringify(result).length > 100 ? "..." : ""
      }`
    );
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error: unknown) {
    console.error("Error executing generic MongoDB query:", error);
    return {
      content: [
        {
          type: "text" as const,
          text: `Error executing generic query: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
    };
  }
}
