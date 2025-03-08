/**
 * Tests for prompt handler
 */

import { renderTemplate, validatePromptData, getRequiredParameters, getOptionalParameters } from './promptHandler';
import { Prompt } from '../types';

describe('Prompt Handler', () => {
  describe('renderTemplate', () => {
    it('should replace variables in a template', () => {
      const template = 'Hello, {{name}}!';
      const data = { name: 'World' };
      expect(renderTemplate(template, data)).toBe('Hello, World!');
    });

    it('should handle nested properties', () => {
      const template = 'User: {{user.name}}, Age: {{user.age}}';
      const data = { user: { name: 'John', age: 30 } };
      expect(renderTemplate(template, data)).toBe('User: John, Age: 30');
    });

    it('should handle conditionals with truthy values', () => {
      const template = 'Hello{{#if name}}, {{name}}{{/if}}!';
      const data = { name: 'World' };
      expect(renderTemplate(template, data)).toBe('Hello, World!');
    });

    it('should handle conditionals with falsy values', () => {
      const template = 'Hello{{#if name}}, {{name}}{{/if}}!';
      const data = { name: '' };
      expect(renderTemplate(template, data)).toBe('Hello!');
    });

    it('should handle conditionals with missing values', () => {
      const template = 'Hello{{#if name}}, {{name}}{{/if}}!';
      const data = {};
      expect(renderTemplate(template, data)).toBe('Hello!');
    });

    it('should handle complex templates with multiple conditionals and variables', () => {
      const template = `{{#if user}}User: {{user.name}}{{#if user.age}}, Age: {{user.age}}{{/if}}{{/if}}{{#if showGreeting}}\nHello!{{/if}}`;
      const data = { 
        user: { name: 'John', age: 30 },
        showGreeting: true
      };
      expect(renderTemplate(template, data)).toBe('User: John, Age: 30\nHello!');
    });
  });

  describe('validatePromptData', () => {
    const testPrompt: Prompt = {
      name: 'test_prompt',
      description: 'Test prompt',
      template: 'Test {{param1}} {{param2}}',
      parameters: {
        type: 'object',
        properties: {
          param1: { type: 'string', description: 'Parameter 1' },
          param2: { type: 'string', description: 'Parameter 2' },
          param3: { type: 'string', description: 'Parameter 3' }
        },
        required: ['param1', 'param2']
      }
    };

    it('should validate data with all required parameters', () => {
      const data = { param1: 'value1', param2: 'value2' };
      expect(validatePromptData(testPrompt, data)).toBe(true);
    });

    it('should validate data with all parameters including optional ones', () => {
      const data = { param1: 'value1', param2: 'value2', param3: 'value3' };
      expect(validatePromptData(testPrompt, data)).toBe(true);
    });

    it('should invalidate data missing required parameters', () => {
      const data = { param1: 'value1' };
      expect(validatePromptData(testPrompt, data)).toBe(false);
    });

    it('should invalidate empty data when parameters are required', () => {
      const data = {};
      expect(validatePromptData(testPrompt, data)).toBe(false);
    });
  });

  describe('getRequiredParameters', () => {
    it('should return all required parameters', () => {
      const testPrompt: Prompt = {
        name: 'test_prompt',
        description: 'Test prompt',
        template: 'Test',
        parameters: {
          type: 'object',
          properties: {
            param1: { type: 'string' },
            param2: { type: 'string' },
            param3: { type: 'string' }
          },
          required: ['param1', 'param2']
        }
      };
      expect(getRequiredParameters(testPrompt)).toEqual(['param1', 'param2']);
    });

    it('should return empty array when no parameters are required', () => {
      const testPrompt: Prompt = {
        name: 'test_prompt',
        description: 'Test prompt',
        template: 'Test',
        parameters: {
          type: 'object',
          properties: {
            param1: { type: 'string' },
            param2: { type: 'string' }
          }
        }
      };
      expect(getRequiredParameters(testPrompt)).toEqual([]);
    });
  });

  describe('getOptionalParameters', () => {
    it('should return all optional parameters', () => {
      const testPrompt: Prompt = {
        name: 'test_prompt',
        description: 'Test prompt',
        template: 'Test',
        parameters: {
          type: 'object',
          properties: {
            param1: { type: 'string' },
            param2: { type: 'string' },
            param3: { type: 'string' }
          },
          required: ['param1']
        }
      };
      expect(getOptionalParameters(testPrompt)).toEqual(['param2', 'param3']);
    });

    it('should return all parameters when none are required', () => {
      const testPrompt: Prompt = {
        name: 'test_prompt',
        description: 'Test prompt',
        template: 'Test',
        parameters: {
          type: 'object',
          properties: {
            param1: { type: 'string' },
            param2: { type: 'string' }
          }
        }
      };
      expect(getOptionalParameters(testPrompt)).toEqual(['param1', 'param2']);
    });

    it('should return empty array when all parameters are required', () => {
      const testPrompt: Prompt = {
        name: 'test_prompt',
        description: 'Test prompt',
        template: 'Test',
        parameters: {
          type: 'object',
          properties: {
            param1: { type: 'string' },
            param2: { type: 'string' }
          },
          required: ['param1', 'param2']
        }
      };
      expect(getOptionalParameters(testPrompt)).toEqual([]);
    });
  });
});
