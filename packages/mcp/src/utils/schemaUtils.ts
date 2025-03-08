/**
 * Utilities for working with MongoDB schemas
 * 
 * These utilities help with inferring and formatting MongoDB schemas
 * for use in prompts and resources.
 */

/**
 * Interface for a simplified MongoDB schema
 */
export interface MongoDBSchema {
  fields: {
    [fieldName: string]: {
      type: string;
      description?: string;
      required?: boolean;
    };
  };
  indexes?: {
    name: string;
    fields: Record<string, 1 | -1 | string>;
    options?: Record<string, any>;
  }[];
}

/**
 * Convert a MongoDB schema to a JSON string
 * 
 * @param schema The MongoDB schema to convert
 * @returns A formatted JSON string representation of the schema
 */
export function schemaToJsonString(schema: MongoDBSchema): string {
  return JSON.stringify(schema, null, 2);
}

/**
 * Generate a simplified schema description from a MongoDB schema
 * 
 * @param schema The MongoDB schema
 * @returns A human-readable description of the schema
 */
export function generateSchemaDescription(schema: MongoDBSchema): string {
  const fieldDescriptions = Object.entries(schema.fields).map(([fieldName, field]) => {
    const requiredText = field.required ? ' (required)' : '';
    const descriptionText = field.description ? `: ${field.description}` : '';
    return `- ${fieldName}: ${field.type}${requiredText}${descriptionText}`;
  });

  let description = 'Fields:\n' + fieldDescriptions.join('\n');

  if (schema.indexes && schema.indexes.length > 0) {
    const indexDescriptions = schema.indexes.map(index => {
      const fieldsText = Object.entries(index.fields)
        .map(([field, direction]) => `${field}:${direction}`)
        .join(', ');
      return `- ${index.name}: ${fieldsText}`;
    });
    description += '\n\nIndexes:\n' + indexDescriptions.join('\n');
  }

  return description;
}

/**
 * Infer a MongoDB schema from sample documents
 * 
 * @param documents Array of sample documents
 * @returns An inferred MongoDB schema
 */
export function inferSchemaFromDocuments(documents: Record<string, any>[]): MongoDBSchema {
  if (!documents || documents.length === 0) {
    return { fields: {} };
  }

  const fields: MongoDBSchema['fields'] = {};

  // Process each document to build the schema
  documents.forEach(doc => {
    Object.entries(doc).forEach(([fieldName, value]) => {
      if (fieldName === '_id') return; // Skip _id field

      // Determine the type
      let type: string;
      if (Array.isArray(value)) {
        type = 'array';
      } else if (value instanceof Date) {
        type = 'date';
      } else if (value === null) {
        type = 'null';
      } else if (typeof value === 'object') {
        type = 'object';
      } else {
        type = typeof value;
      }

      // Add or update the field
      if (!fields[fieldName]) {
        fields[fieldName] = { type };
      } else if (fields[fieldName].type !== type) {
        // If we have conflicting types, use 'mixed'
        fields[fieldName].type = 'mixed';
      }
    });
  });

  return { fields };
}

/**
 * Generate a sample MongoDB document based on a schema
 * 
 * @param schema The MongoDB schema
 * @returns A sample document conforming to the schema
 */
export function generateSampleDocument(schema: MongoDBSchema): Record<string, any> {
  const sample: Record<string, any> = {};

  Object.entries(schema.fields).forEach(([fieldName, field]) => {
    // Skip _id field
    if (fieldName === '_id') return;

    // Generate a sample value based on the type
    switch (field.type) {
      case 'string':
        sample[fieldName] = `Sample ${fieldName}`;
        break;
      case 'number':
        sample[fieldName] = 42;
        break;
      case 'boolean':
        sample[fieldName] = true;
        break;
      case 'date':
        sample[fieldName] = new Date().toISOString();
        break;
      case 'array':
        sample[fieldName] = ['sample', 'array', 'values'];
        break;
      case 'object':
        sample[fieldName] = { nestedField: 'nested value' };
        break;
      case 'null':
        sample[fieldName] = null;
        break;
      case 'mixed':
        sample[fieldName] = 'Sample mixed value';
        break;
      default:
        sample[fieldName] = `Sample ${field.type} value`;
    }
  });

  return sample;
}
