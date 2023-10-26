import { FunctionDefinition } from "@azure/openai";
import { EmbeddedContent, HttpVerb } from "chat-core";
import { PersistedHttpRequestFunctionDefinition } from "./PersistedFunctionDefinition";
import { HttpRequestArgsOpenAiFunctionDefinition } from "./HttpRequestArgs";
import { OpenAPIV3 } from "openapi-types";
import { JSONSchema4Object } from "json-schema";

export interface ApiEmbeddedContentMetadata {
  method: "get" | "post" | "put" | "delete" | "patch" | "head" | "options";
  path: string;
  baseUrl: string;
  operationId: string;
  summary?: string;
  description?: string;
  requestBody?: OpenAPIV3.RequestBodyObject;
  parameters?: OpenAPIV3.ParameterObject[];
}

/**
  Constructs a {@link FunctionDefinition} for LLM to call based on an {@link EmbeddedContent}.
 */
export function makePersistedHttpRequestFunctionDefinition(
  apiEmbeddedContent: EmbeddedContent
): PersistedHttpRequestFunctionDefinition {
  if (apiEmbeddedContent.metadata === undefined) {
    throw new Error("API method is undefined");
  }
  // SKUNK_HACK: casting as the type. we should make the Metadata a generic type
  const metadata =
    apiEmbeddedContent.metadata as unknown as ApiEmbeddedContentMetadata;
  return {
    // Function definition used by ChatGPT
    definition: {
      name: metadata.operationId,
      description: makeDescription(metadata),
      parameters: {
        type: "object",
        properties: makeParameterProperties(metadata),
      },
    },
    // Data used by the application
    httpVerb: metadata.method.toUpperCase() as HttpVerb,
    path: metadata.baseUrl + metadata.path,
  };
}

function makeDescription(metadata: ApiEmbeddedContentMetadata): string {
  return `Execute request to ${metadata.method.toUpperCase()} ${
    metadata.baseUrl
  }${metadata.path}
  
${metadata.summary ? "Summary: " + metadata.summary + "\n" : ""}${
    metadata.description ? "Description: " + metadata.description + "\n" : ""
  }
`;
}

function makeParameterProperties(metadata: ApiEmbeddedContentMetadata) {
  const properties: Record<string, unknown> = {};
  if (metadata.parameters) {
    properties.queryParameters = makeParameters(
      metadata.parameters,
      "query",
      "Query Parameters"
    );
    properties.pathParameters = makeParameters(
      metadata.parameters,
      "path",
      "Path Parameters"
    );
  }
  if (metadata.requestBody) {
    properties.body = makeRequestBody(metadata.requestBody);
  }
  return properties;
}

function makeParameters(
  reqParameters: OpenAPIV3.ParameterObject[],
  inType: "path" | "query",
  description: string
): HttpRequestArgsOpenAiFunctionDefinition["parameters"]["properties"]["queryParameters"] {
  const rawQueryParameters = reqParameters.filter(
    (param) => param.in === inType
  );

  const queryParameters = {
    type: "object",
    description,
    properties: {} as Record<string, unknown>,
    required: [] as string[],
  };
  for (const param of rawQueryParameters) {
    queryParameters.properties[param.name] = {
      type: "string",
      description: param.description,
    };
    if (param.required) {
      queryParameters.required?.push(param.name);
    }
  }
  return queryParameters as HttpRequestArgsOpenAiFunctionDefinition["parameters"]["properties"]["queryParameters"];
}

function makeRequestBody(
  requestBody: OpenAPIV3.RequestBodyObject
): JSONSchema4Object {
  const content = requestBody.content;
  const [key] = Object.keys(content);
  return content[key].schema as JSONSchema4Object;
}
