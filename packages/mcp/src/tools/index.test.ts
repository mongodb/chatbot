/**
 * Tests for MCP tools
 */

import { helloWorldTool } from './index';

describe('MCP Tools', () => {
  describe('helloWorldTool', () => {
    it('should return a greeting message', async () => {
      const result = await helloWorldTool.handler({ name: 'Test User' });
      expect(result).toEqual({ message: 'Hello, Test User!' });
    });
  });
});
