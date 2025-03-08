/**
 * Tests for prompt service
 */

import { PromptService, InvalidPromptDataError } from './promptService';
import { Prompt } from '../types';
import { MongoDBSchema } from '../utils/schemaUtils';

describe('Prompt Service', () => {
  let promptService: PromptService;
  
  const testPrompt: Prompt = {
    name: 'test_prompt',
    description: 'Test prompt',
    template: 'Test {{param1}} {{param2}}',
    parameters: {
      type: 'object',
      properties: {
        param1: { type: 'string', description: 'Parameter 1' },
        param2: { type: 'string', description: 'Parameter 2' }
      },
      required: ['param1']
    }
  };

  const mongoQueryPrompt: Prompt = {
    name: 'mongodb_query',
    description: 'Generate a MongoDB query',
    template: 'Collection: {{collection}}\nSchema: {{schema}}\nDescription: {{description}}',
    parameters: {
      type: 'object',
      properties: {
        description: { type: 'string', description: 'Query description' },
        collection: { type: 'string', description: 'Collection name' },
        schema: { type: 'string', description: 'Collection schema' }
      },
      required: ['description']
    }
  };

  const mongoAggregationPrompt: Prompt = {
    name: 'mongodb_aggregation',
    description: 'Generate a MongoDB aggregation',
    template: 'Collection: {{collection}}\nSchema: {{schema}}\nDescription: {{description}}',
    parameters: {
      type: 'object',
      properties: {
        description: { type: 'string', description: 'Aggregation description' },
        collection: { type: 'string', description: 'Collection name' },
        schema: { type: 'string', description: 'Collection schema' }
      },
      required: ['description']
    }
  };

  const mongoUpdatePrompt: Prompt = {
    name: 'mongodb_update',
    description: 'Generate a MongoDB update',
    template: 'Collection: {{collection}}\nSchema: {{schema}}\nDescription: {{description}}',
    parameters: {
      type: 'object',
      properties: {
        description: { type: 'string', description: 'Update description' },
        collection: { type: 'string', description: 'Collection name' },
        schema: { type: 'string', description: 'Collection schema' }
      },
      required: ['description']
    }
  };

  const mongoSchemaDesignPrompt: Prompt = {
    name: 'mongodb_schema_design',
    description: 'Generate a MongoDB schema design',
    template: 'Requirements: {{requirements}}',
    parameters: {
      type: 'object',
      properties: {
        requirements: { type: 'string', description: 'Schema requirements' }
      },
      required: ['requirements']
    }
  };

  const mongoIndexRecommendationPrompt: Prompt = {
    name: 'mongodb_index_recommendation',
    description: 'Generate MongoDB index recommendations',
    template: 'Collection: {{collection}}\nSchema: {{schema}}\nQuery Patterns: {{queryPatterns}}',
    parameters: {
      type: 'object',
      properties: {
        queryPatterns: { type: 'string', description: 'Query patterns' },
        collection: { type: 'string', description: 'Collection name' },
        schema: { type: 'string', description: 'Collection schema' }
      },
      required: ['queryPatterns']
    }
  };

  beforeEach(() => {
    promptService = new PromptService();
    promptService.registerPrompt(testPrompt);
    promptService.registerPrompt(mongoQueryPrompt);
    promptService.registerPrompt(mongoAggregationPrompt);
    promptService.registerPrompt(mongoUpdatePrompt);
    promptService.registerPrompt(mongoSchemaDesignPrompt);
    promptService.registerPrompt(mongoIndexRecommendationPrompt);
  });

  describe('registerPrompt and getPrompt', () => {
    it('should register and retrieve a prompt', () => {
      const prompt = promptService.getPrompt('test_prompt');
      expect(prompt).toEqual(testPrompt);
    });

    it('should return undefined for non-existent prompts', () => {
      const prompt = promptService.getPrompt('non_existent');
      expect(prompt).toBeUndefined();
    });
  });

  describe('getAllPrompts', () => {
    it('should return all registered prompts', () => {
      const prompts = promptService.getAllPrompts();
      expect(prompts).toHaveLength(6);
      expect(prompts).toContainEqual(testPrompt);
      expect(prompts).toContainEqual(mongoQueryPrompt);
    });
  });

  describe('executePrompt', () => {
    it('should execute a prompt with valid data', () => {
      const result = promptService.executePrompt('test_prompt', { param1: 'value1', param2: 'value2' });
      expect(result).toBe('Test value1 value2');
    });

    it('should execute a prompt with only required data', () => {
      const result = promptService.executePrompt('test_prompt', { param1: 'value1' });
      expect(result).toBe('Test value1 ');
    });

    it('should throw for non-existent prompts', () => {
      expect(() => {
        promptService.executePrompt('non_existent', {});
      }).toThrow("Prompt 'non_existent' not found");
    });

    it('should throw for invalid data', () => {
      expect(() => {
        promptService.executePrompt('test_prompt', {});
      }).toThrow(InvalidPromptDataError);
    });
  });

  describe('MongoDB specific prompt execution', () => {
    const testSchema: MongoDBSchema = {
      fields: {
        name: { type: 'string', required: true },
        age: { type: 'number' }
      }
    };

    it('should execute MongoDB query prompt', () => {
      const result = promptService.executeMongoDBQueryPrompt('Find all users over 30', 'users', testSchema);
      expect(result).toContain('Collection: users');
      expect(result).toContain('Description: Find all users over 30');
      expect(result).toContain('Schema:');
      expect(result).toContain('"name": {');
    });

    it('should execute MongoDB aggregation prompt', () => {
      const result = promptService.executeMongoDBAggrPrompt('Group users by age', 'users', testSchema);
      expect(result).toContain('Collection: users');
      expect(result).toContain('Description: Group users by age');
      expect(result).toContain('Schema:');
    });

    it('should execute MongoDB update prompt', () => {
      const result = promptService.executeMongoDBUpdatePrompt('Update user name', 'users', testSchema);
      expect(result).toContain('Collection: users');
      expect(result).toContain('Description: Update user name');
      expect(result).toContain('Schema:');
    });

    it('should execute MongoDB schema design prompt', () => {
      const result = promptService.executeMongoDBSchemaDesignPrompt('Design a schema for a blog application');
      expect(result).toBe('Requirements: Design a schema for a blog application');
    });

    it('should execute MongoDB index recommendation prompt', () => {
      const result = promptService.executeMongoDBIndexRecommendationPrompt(
        'Frequently query by name and age',
        'users',
        testSchema
      );
      expect(result).toContain('Collection: users');
      expect(result).toContain('Query Patterns: Frequently query by name and age');
      expect(result).toContain('Schema:');
    });

    it('should handle missing optional parameters', () => {
      const result = promptService.executeMongoDBQueryPrompt('Find all users');
      expect(result).toContain('Description: Find all users');
      expect(result).not.toContain('Collection:');
      expect(result).not.toContain('Schema:');
    });
  });
});
