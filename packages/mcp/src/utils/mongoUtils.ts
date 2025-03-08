/**
 * MongoDB utilities for the MCP server
 * 
 * This module provides utilities for working with MongoDB queries,
 * aggregations, and other operations.
 */

/**
 * Parse a MongoDB query string into a query object
 * 
 * @param queryString MongoDB query as a string
 * @returns Parsed MongoDB query object
 * @throws {Error} If the query string is invalid
 */
export function parseMongoDBQuery(queryString: string): Record<string, any> {
  try {
    // Remove any leading/trailing whitespace and ensure it's valid JSON
    const trimmedQuery = queryString.trim();
    return JSON.parse(trimmedQuery);
  } catch (error: any) {
    throw new Error(`Invalid MongoDB query: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Parse a MongoDB aggregation pipeline string into an array of stages
 * 
 * @param pipelineString MongoDB aggregation pipeline as a string
 * @returns Parsed MongoDB aggregation pipeline
 * @throws {Error} If the pipeline string is invalid
 */
export function parseMongoDBPipeline(pipelineString: string): Array<Record<string, any>> {
  try {
    // Remove any leading/trailing whitespace and ensure it's valid JSON
    const trimmedPipeline = pipelineString.trim();
    const pipeline = JSON.parse(trimmedPipeline);
    
    if (!Array.isArray(pipeline)) {
      throw new Error('Aggregation pipeline must be an array');
    }
    
    return pipeline;
  } catch (error: any) {
    throw new Error(`Invalid MongoDB aggregation pipeline: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Parse a MongoDB update operation string into an update object
 * 
 * @param updateString MongoDB update operation as a string
 * @returns Parsed MongoDB update operation
 * @throws {Error} If the update string is invalid
 */
export function parseMongoDBUpdate(updateString: string): {
  filter: Record<string, any>;
  update: Record<string, any>;
  options?: Record<string, any>;
} {
  try {
    // Remove any leading/trailing whitespace and ensure it's valid JSON
    const trimmedUpdate = updateString.trim();
    const update = JSON.parse(trimmedUpdate);
    
    if (!update.filter || !update.update) {
      throw new Error('Update operation must include both filter and update properties');
    }
    
    return update;
  } catch (error: any) {
    throw new Error(`Invalid MongoDB update operation: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Validate a MongoDB query against a collection schema
 * 
 * @param query MongoDB query object
 * @param schema MongoDB collection schema
 * @returns Validation result with any errors
 */
export function validateMongoDBQuery(
  query: Record<string, any>,
  schema: Record<string, any>
): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];
  
  // Basic validation - check if query fields exist in schema
  Object.keys(query).forEach(key => {
    // Skip MongoDB operators
    if (key.startsWith('$')) return;
    
    // Check if the field exists in the schema
    if (schema.fields && !schema.fields[key]) {
      errors.push(`Field '${key}' does not exist in the schema`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Format a MongoDB query for better readability
 * 
 * @param query MongoDB query object
 * @returns Formatted query string
 */
export function formatMongoDBQuery(query: Record<string, any>): string {
  return JSON.stringify(query, null, 2);
}

/**
 * Format a MongoDB aggregation pipeline for better readability
 * 
 * @param pipeline MongoDB aggregation pipeline
 * @returns Formatted pipeline string
 */
export function formatMongoDBPipeline(pipeline: Array<Record<string, any>>): string {
  return JSON.stringify(pipeline, null, 2);
}

/**
 * Generate a MongoDB query explanation
 * 
 * @param query MongoDB query object
 * @returns Human-readable explanation of the query
 */
export function explainMongoDBQuery(query: Record<string, any>): string {
  let explanation = 'This query ';
  
  // Handle empty query
  if (Object.keys(query).length === 0) {
    return explanation + 'will return all documents in the collection.';
  }
  
  const conditions: string[] = [];
  
  // Process each top-level field
  Object.entries(query).forEach(([key, value]) => {
    if (key === '$and') {
      if (Array.isArray(value)) {
        conditions.push(`matches ALL of the following conditions: ${value.map(cond => explainMongoDBQuery(cond)).join(' AND ')}`);
      }
    } else if (key === '$or') {
      if (Array.isArray(value)) {
        conditions.push(`matches ANY of the following conditions: ${value.map(cond => explainMongoDBQuery(cond)).join(' OR ')}`);
      }
    } else if (key === '$nor') {
      if (Array.isArray(value)) {
        conditions.push(`does NOT match ANY of the following conditions: ${value.map(cond => explainMongoDBQuery(cond)).join(' OR ')}`);
      }
    } else if (key === '$not') {
      conditions.push(`does NOT match the following condition: ${explainMongoDBQuery(value)}`);
    } else if (key === '$sort') {
      const sortFields = Object.entries(value).map(([field, dir]) => `${field} (${dir === 1 ? 'ascending' : 'descending'})`);
      conditions.push(`is sorted by ${sortFields.join(', ')}`);
    } else if (key === '$limit') {
      conditions.push(`is limited to ${value} results`);
    } else if (key === '$skip') {
      conditions.push(`skips the first ${value} results`);
    } else if (!key.startsWith('$')) {
      // Regular field
      if (typeof value === 'object' && value !== null) {
        // Operator expression
        Object.entries(value).forEach(([op, val]) => {
          switch (op) {
            case '$eq':
              conditions.push(`has field '${key}' equal to ${JSON.stringify(val)}`);
              break;
            case '$gt':
              conditions.push(`has field '${key}' greater than ${JSON.stringify(val)}`);
              break;
            case '$gte':
              conditions.push(`has field '${key}' greater than or equal to ${JSON.stringify(val)}`);
              break;
            case '$lt':
              conditions.push(`has field '${key}' less than ${JSON.stringify(val)}`);
              break;
            case '$lte':
              conditions.push(`has field '${key}' less than or equal to ${JSON.stringify(val)}`);
              break;
            case '$ne':
              conditions.push(`has field '${key}' not equal to ${JSON.stringify(val)}`);
              break;
            case '$in':
              conditions.push(`has field '${key}' in the values ${JSON.stringify(val)}`);
              break;
            case '$nin':
              conditions.push(`has field '${key}' not in the values ${JSON.stringify(val)}`);
              break;
            case '$exists':
              conditions.push(`has field '${key}' ${val ? 'existing' : 'not existing'}`);
              break;
            case '$regex':
              conditions.push(`has field '${key}' matching the pattern ${val}`);
              break;
            default:
              conditions.push(`has field '${key}' with operator ${op} and value ${JSON.stringify(val)}`);
          }
        });
      } else {
        // Direct value comparison (implicit $eq)
        conditions.push(`has field '${key}' equal to ${JSON.stringify(value)}`);
      }
    }
  });
  
  return explanation + conditions.join(' and ');
}
