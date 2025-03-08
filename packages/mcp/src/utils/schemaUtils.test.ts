/**
 * Tests for MongoDB schema utilities
 */

import {
  MongoDBSchema,
  schemaToJsonString,
  generateSchemaDescription,
  inferSchemaFromDocuments,
  generateSampleDocument
} from './schemaUtils';

describe('Schema Utilities', () => {
  const testSchema: MongoDBSchema = {
    fields: {
      name: { type: 'string', required: true, description: 'User name' },
      age: { type: 'number', description: 'User age' },
      email: { type: 'string', required: true },
      isActive: { type: 'boolean' }
    },
    indexes: [
      { name: 'email_idx', fields: { email: 1 }, options: { unique: true } },
      { name: 'compound_idx', fields: { name: 1, age: -1 } }
    ]
  };

  describe('schemaToJsonString', () => {
    it('should convert a schema to a formatted JSON string', () => {
      const jsonString = schemaToJsonString(testSchema);
      expect(typeof jsonString).toBe('string');
      expect(jsonString).toContain('"name": {');
      expect(jsonString).toContain('"indexes": [');
      
      // Should be able to parse it back to an object
      const parsedSchema = JSON.parse(jsonString);
      expect(parsedSchema).toHaveProperty('fields');
      expect(parsedSchema).toHaveProperty('indexes');
    });
  });

  describe('generateSchemaDescription', () => {
    it('should generate a human-readable description of a schema', () => {
      const description = generateSchemaDescription(testSchema);
      expect(description).toContain('Fields:');
      expect(description).toContain('- name: string (required): User name');
      expect(description).toContain('- age: number: User age');
      expect(description).toContain('- email: string (required)');
      expect(description).toContain('- isActive: boolean');
      expect(description).toContain('Indexes:');
      expect(description).toContain('- email_idx: email:1');
      expect(description).toContain('- compound_idx: name:1, age:-1');
    });

    it('should handle schemas without indexes', () => {
      const schemaWithoutIndexes: MongoDBSchema = {
        fields: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      };
      const description = generateSchemaDescription(schemaWithoutIndexes);
      expect(description).toContain('Fields:');
      expect(description).toContain('- name: string');
      expect(description).toContain('- age: number');
      expect(description).not.toContain('Indexes:');
    });
  });

  describe('inferSchemaFromDocuments', () => {
    it('should infer a schema from sample documents', () => {
      const documents = [
        { name: 'John', age: 30, email: 'john@example.com', isActive: true },
        { name: 'Jane', age: 25, email: 'jane@example.com', isActive: false, tags: ['user', 'premium'] },
        { name: 'Bob', age: 40, email: 'bob@example.com', metadata: { joined: '2023-01-01' } }
      ];

      const schema = inferSchemaFromDocuments(documents);
      
      expect(schema.fields).toHaveProperty('name');
      expect(schema.fields.name.type).toBe('string');
      
      expect(schema.fields).toHaveProperty('age');
      expect(schema.fields.age.type).toBe('number');
      
      expect(schema.fields).toHaveProperty('email');
      expect(schema.fields.email.type).toBe('string');
      
      expect(schema.fields).toHaveProperty('isActive');
      expect(schema.fields.isActive.type).toBe('boolean');
      
      expect(schema.fields).toHaveProperty('tags');
      expect(schema.fields.tags.type).toBe('array');
      
      expect(schema.fields).toHaveProperty('metadata');
      expect(schema.fields.metadata.type).toBe('object');
    });

    it('should handle empty document arrays', () => {
      const schema = inferSchemaFromDocuments([]);
      expect(schema).toEqual({ fields: {} });
    });

    it('should handle conflicting types', () => {
      const documents = [
        { field: 'string value' },
        { field: 42 }
      ];

      const schema = inferSchemaFromDocuments(documents);
      expect(schema.fields.field.type).toBe('mixed');
    });
  });

  describe('generateSampleDocument', () => {
    it('should generate a sample document based on a schema', () => {
      const sample = generateSampleDocument(testSchema);
      
      expect(sample).toHaveProperty('name');
      expect(typeof sample.name).toBe('string');
      
      expect(sample).toHaveProperty('age');
      expect(typeof sample.age).toBe('number');
      
      expect(sample).toHaveProperty('email');
      expect(typeof sample.email).toBe('string');
      
      expect(sample).toHaveProperty('isActive');
      expect(typeof sample.isActive).toBe('boolean');
    });

    it('should handle various field types', () => {
      const complexSchema: MongoDBSchema = {
        fields: {
          stringField: { type: 'string' },
          numberField: { type: 'number' },
          booleanField: { type: 'boolean' },
          dateField: { type: 'date' },
          arrayField: { type: 'array' },
          objectField: { type: 'object' },
          nullField: { type: 'null' },
          mixedField: { type: 'mixed' },
          customField: { type: 'custom' }
        }
      };

      const sample = generateSampleDocument(complexSchema);
      
      expect(typeof sample.stringField).toBe('string');
      expect(typeof sample.numberField).toBe('number');
      expect(typeof sample.booleanField).toBe('boolean');
      expect(typeof sample.dateField).toBe('string');
      expect(sample.dateField).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(Array.isArray(sample.arrayField)).toBe(true);
      expect(typeof sample.objectField).toBe('object');
      expect(sample.nullField).toBeNull();
      expect(sample.mixedField).toBeDefined();
      expect(sample.customField).toContain('custom');
    });
  });
});
