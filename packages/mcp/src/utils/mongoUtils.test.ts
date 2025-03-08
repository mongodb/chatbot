/**
 * Tests for MongoDB utilities
 */

import {
  parseMongoDBQuery,
  parseMongoDBPipeline,
  parseMongoDBUpdate,
  validateMongoDBQuery,
  formatMongoDBQuery,
  formatMongoDBPipeline,
  explainMongoDBQuery
} from './mongoUtils';

describe('MongoDB Utilities', () => {
  describe('parseMongoDBQuery', () => {
    it('should parse a valid query string', () => {
      const queryString = '{"name": "John", "age": {"$gt": 30}}';
      const result = parseMongoDBQuery(queryString);
      expect(result).toEqual({ name: 'John', age: { $gt: 30 } });
    });

    it('should handle whitespace', () => {
      const queryString = ' {"name": "John"} ';
      const result = parseMongoDBQuery(queryString);
      expect(result).toEqual({ name: 'John' });
    });

    it('should throw for invalid JSON', () => {
      const queryString = '{name: "John"}';
      expect(() => parseMongoDBQuery(queryString)).toThrow('Invalid MongoDB query');
    });
  });

  describe('parseMongoDBPipeline', () => {
    it('should parse a valid pipeline string', () => {
      const pipelineString = '[{"$match": {"age": {"$gt": 30}}}, {"$sort": {"name": 1}}]';
      const result = parseMongoDBPipeline(pipelineString);
      expect(result).toEqual([
        { $match: { age: { $gt: 30 } } },
        { $sort: { name: 1 } }
      ]);
    });

    it('should throw for non-array input', () => {
      const pipelineString = '{"$match": {"age": {"$gt": 30}}}';
      expect(() => parseMongoDBPipeline(pipelineString)).toThrow('Aggregation pipeline must be an array');
    });

    it('should throw for invalid JSON', () => {
      const pipelineString = '[{$match: {age: {$gt: 30}}}]';
      expect(() => parseMongoDBPipeline(pipelineString)).toThrow('Invalid MongoDB aggregation pipeline');
    });
  });

  describe('parseMongoDBUpdate', () => {
    it('should parse a valid update string', () => {
      const updateString = '{"filter": {"name": "John"}, "update": {"$set": {"age": 31}}}';
      const result = parseMongoDBUpdate(updateString);
      expect(result).toEqual({
        filter: { name: 'John' },
        update: { $set: { age: 31 } }
      });
    });

    it('should parse an update with options', () => {
      const updateString = '{"filter": {"name": "John"}, "update": {"$set": {"age": 31}}, "options": {"upsert": true}}';
      const result = parseMongoDBUpdate(updateString);
      expect(result).toEqual({
        filter: { name: 'John' },
        update: { $set: { age: 31 } },
        options: { upsert: true }
      });
    });

    it('should throw if filter is missing', () => {
      const updateString = '{"update": {"$set": {"age": 31}}}';
      expect(() => parseMongoDBUpdate(updateString)).toThrow('Update operation must include both filter and update properties');
    });

    it('should throw if update is missing', () => {
      const updateString = '{"filter": {"name": "John"}}';
      expect(() => parseMongoDBUpdate(updateString)).toThrow('Update operation must include both filter and update properties');
    });

    it('should throw for invalid JSON', () => {
      const updateString = '{filter: {name: "John"}, update: {$set: {age: 31}}}';
      expect(() => parseMongoDBUpdate(updateString)).toThrow('Invalid MongoDB update operation');
    });
  });

  describe('validateMongoDBQuery', () => {
    const schema = {
      fields: {
        name: { type: 'string' },
        age: { type: 'number' },
        email: { type: 'string' }
      }
    };

    it('should validate a query with valid fields', () => {
      const query = { name: 'John', age: { $gt: 30 } };
      const result = validateMongoDBQuery(query, schema);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should invalidate a query with unknown fields', () => {
      const query = { name: 'John', unknown: 'value' };
      const result = validateMongoDBQuery(query, schema);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Field 'unknown' does not exist in the schema");
    });

    it('should handle MongoDB operators', () => {
      const query = { $and: [{ name: 'John' }, { age: { $gt: 30 } }] };
      const result = validateMongoDBQuery(query, schema);
      expect(result.valid).toBe(true);
    });
  });

  describe('formatMongoDBQuery', () => {
    it('should format a query for readability', () => {
      const query = { name: 'John', age: { $gt: 30 } };
      const result = formatMongoDBQuery(query);
      expect(result).toBe(JSON.stringify(query, null, 2));
    });
  });

  describe('formatMongoDBPipeline', () => {
    it('should format a pipeline for readability', () => {
      const pipeline = [{ $match: { age: { $gt: 30 } } }, { $sort: { name: 1 } }];
      const result = formatMongoDBPipeline(pipeline);
      expect(result).toBe(JSON.stringify(pipeline, null, 2));
    });
  });

  describe('explainMongoDBQuery', () => {
    it('should explain an empty query', () => {
      const query = {};
      const result = explainMongoDBQuery(query);
      expect(result).toBe('This query will return all documents in the collection.');
    });

    it('should explain a simple equality query', () => {
      const query = { name: 'John' };
      const result = explainMongoDBQuery(query);
      expect(result).toBe('This query has field \'name\' equal to "John"');
    });

    it('should explain a query with operators', () => {
      const query = { age: { $gt: 30 } };
      const result = explainMongoDBQuery(query);
      expect(result).toBe('This query has field \'age\' greater than 30');
    });

    it('should explain a complex query with multiple conditions', () => {
      const query = {
        name: 'John',
        age: { $gt: 30 },
        $or: [{ status: 'active' }, { role: 'admin' }]
      };
      const result = explainMongoDBQuery(query);
      expect(result).toContain('This query has field \'name\' equal to "John"');
      expect(result).toContain('has field \'age\' greater than 30');
      expect(result).toContain('matches ANY of the following conditions');
    });
  });
});
