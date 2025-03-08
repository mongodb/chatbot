/**
 * Type definitions for the MCP server
 */

// These are placeholder types until we have proper type definitions from the SDK
export interface Server {
  registerTool: (tool: Tool) => void;
  registerResource: (resource: Resource) => void;
  registerPrompt: (prompt: Prompt) => void;
  listen: () => Promise<void>;
}

export interface Tool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
  handler: (params: any) => Promise<any>;
}

export interface Resource {
  uri: string;
  contentType: string;
  read: () => Promise<string>;
}

export interface Prompt {
  name: string;
  description: string;
  template: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ServerOptions {
  name: string;
  description: string;
  version: string;
}

export function createServer(options: ServerOptions): Server {
  // This is a placeholder until we have the actual SDK
  return {
    registerTool: () => {},
    registerResource: () => {},
    registerPrompt: () => {},
    listen: async () => {
      console.log('Server started (placeholder implementation)');
    }
  };
}
