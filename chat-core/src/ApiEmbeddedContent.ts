export type HttpVerb =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS";

export interface OpenApiEndpointDefinition {
  parameters?: Record<string, unknown>[];
  requestBody?: any;
}
/**
  Type for what we store in the DB in the "api_embedded_content" collection.
 */
export interface ApiEmbeddedContent {
  /**
      definition of the endpoint from the API spec
     */
  definition: OpenApiEndpointDefinition;

  /**
      HTTP verb for the endpoint.
     */
  httpVerb: HttpVerb;

  /**
      URL path for the endpoint.
      @example
      /api/atlas/v2.0/groups/{GROUP-ID}/clusters/
     */
  path: string;

  /**
      Function description from the API spec + metadata as frontmatter
      @example
      httpAction: GET
      endpoint: /api/atlas/v2.0/groups/{GROUP-ID}/clusters/
      actionName: getClusters
      description: Get all clusters in a group.
     */
  embeddingText: string;

  /**
      Vector representation of the embedding_text.
     */
  embedding: number[];

  /**
      Metadata. Used in the embedding text and also could be used for search.
     */
  metadata: Record<string, unknown>;
}
