import { FunctionDefinition } from "@azure/openai";

/**
  {@link FunctionDefinition} for an HTTP request.
 */
export interface HttpRequestArgsOpenAiFunctionDefinition
  extends FunctionDefinition {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: {
      pathParameters?: {
        type: "object";
        description?: string;
        properties: Record<string, string>;
        required?: string[];
      };
      queryParameters?: {
        type: "object";
        description?: string;
        properties: Record<string, string>;
        required?: string[];
      };
      body?: {
        type: "object";
        description?: string;
        properties: Record<string, unknown>;
        required?: string[];
      };
      headers?: {
        type: "object";
        description?: string;
        properties: Record<string, unknown>;
        required?: string[];
      };
      required?: string[];
    };
  };
}

/**
  Arguments for an HTTP request that are returned from an OpenAI function
  that uses the {@link HttpRequestArgsOpenAiFunctionDefinition} as its schema.
 */
export interface HttpRequestArgs {
  pathParameters?: Record<string, unknown>;
  queryParameters?: Record<string, unknown>;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

/**
  Credentials for API request.
 */
export interface HttpApiCredentials {
  // POST_SKUNK_TODO: consider supporting other auth types
  type: "digest" | "basic";
  username: string;
  password: string;
}
