/**
 * Prompt service for MongoDB MCP server
 * 
 * This service handles the execution of prompts with MongoDB data.
 */

import { Prompt } from '../types';
import { renderPrompt, validatePromptData } from './promptHandler';
import { MongoDBSchema, schemaToJsonString } from '../utils/schemaUtils';

/**
 * Error thrown when prompt data is invalid
 */
export class InvalidPromptDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPromptDataError';
  }
}

/**
 * Service for executing MongoDB prompts
 */
export class PromptService {
  private prompts: Map<string, Prompt> = new Map();

  /**
   * Register a prompt with the service
   * 
   * @param prompt The prompt to register
   */
  registerPrompt(prompt: Prompt): void {
    this.prompts.set(prompt.name, prompt);
  }

  /**
   * Get a prompt by name
   * 
   * @param name The name of the prompt to get
   * @returns The prompt or undefined if not found
   */
  getPrompt(name: string): Prompt | undefined {
    return this.prompts.get(name);
  }

  /**
   * Get all registered prompts
   * 
   * @returns Array of all registered prompts
   */
  getAllPrompts(): Prompt[] {
    return Array.from(this.prompts.values());
  }

  /**
   * Execute a prompt with the given data
   * 
   * @param promptName The name of the prompt to execute
   * @param data The data to use for the prompt
   * @returns The rendered prompt
   * @throws {Error} If the prompt is not found
   * @throws {InvalidPromptDataError} If the data is invalid for the prompt
   */
  executePrompt(promptName: string, data: Record<string, any>): string {
    const prompt = this.getPrompt(promptName);
    if (!prompt) {
      throw new Error(`Prompt '${promptName}' not found`);
    }

    if (!validatePromptData(prompt, data)) {
      throw new InvalidPromptDataError(`Invalid data for prompt '${promptName}'`);
    }

    return renderPrompt(prompt, data);
  }

  /**
   * Execute a MongoDB query prompt
   * 
   * @param description Natural language description of the query
   * @param collection Optional collection name
   * @param schema Optional collection schema
   * @returns The rendered prompt
   */
  executeMongoDBQueryPrompt(description: string, collection?: string, schema?: MongoDBSchema): string {
    const data: Record<string, any> = { description };
    
    if (collection) {
      data.collection = collection;
    }
    
    if (schema) {
      data.schema = schemaToJsonString(schema);
    }
    
    return this.executePrompt('mongodb_query', data);
  }

  /**
   * Execute a MongoDB aggregation prompt
   * 
   * @param description Natural language description of the aggregation
   * @param collection Optional collection name
   * @param schema Optional collection schema
   * @returns The rendered prompt
   */
  executeMongoDBAggrPrompt(description: string, collection?: string, schema?: MongoDBSchema): string {
    const data: Record<string, any> = { description };
    
    if (collection) {
      data.collection = collection;
    }
    
    if (schema) {
      data.schema = schemaToJsonString(schema);
    }
    
    return this.executePrompt('mongodb_aggregation', data);
  }

  /**
   * Execute a MongoDB update prompt
   * 
   * @param description Natural language description of the update
   * @param collection Optional collection name
   * @param schema Optional collection schema
   * @returns The rendered prompt
   */
  executeMongoDBUpdatePrompt(description: string, collection?: string, schema?: MongoDBSchema): string {
    const data: Record<string, any> = { description };
    
    if (collection) {
      data.collection = collection;
    }
    
    if (schema) {
      data.schema = schemaToJsonString(schema);
    }
    
    return this.executePrompt('mongodb_update', data);
  }

  /**
   * Execute a MongoDB schema design prompt
   * 
   * @param requirements Requirements for the schema design
   * @returns The rendered prompt
   */
  executeMongoDBSchemaDesignPrompt(requirements: string): string {
    return this.executePrompt('mongodb_schema_design', { requirements });
  }

  /**
   * Execute a MongoDB index recommendation prompt
   * 
   * @param queryPatterns Description of query patterns
   * @param collection Optional collection name
   * @param schema Optional collection schema
   * @returns The rendered prompt
   */
  executeMongoDBIndexRecommendationPrompt(
    queryPatterns: string,
    collection?: string,
    schema?: MongoDBSchema
  ): string {
    const data: Record<string, any> = { queryPatterns };
    
    if (collection) {
      data.collection = collection;
    }
    
    if (schema) {
      data.schema = schemaToJsonString(schema);
    }
    
    return this.executePrompt('mongodb_index_recommendation', data);
  }
}
