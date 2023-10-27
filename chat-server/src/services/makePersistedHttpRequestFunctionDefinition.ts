import { FunctionDefinition } from "@azure/openai";
import { EmbeddedContent, HttpVerb, validateMetadata } from "chat-core";
import { PersistedHttpRequestFunctionDefinition } from "./PersistedFunctionDefinition";
import { HttpRequestArgsOpenAiFunctionDefinition } from "./HttpRequestArgs";
import { OpenAPIV3 } from "openapi-types";
import { JSONSchema4Object } from "json-schema";
import { z } from "zod";

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
  embeddedContent: EmbeddedContent
): PersistedHttpRequestFunctionDefinition {
  const apiEmbeddedContent = validateMetadata<ApiEmbeddedContentMetadata>(
    embeddedContent,
    {
      method: z.enum([
        "get",
        "post",
        "put",
        "delete",
        "patch",
        "head",
        "options",
      ]),
      baseUrl: z.string(),
      operationId: z.string(),
      path: z.string(),
      description: z.string().optional(),
      parameters: z
        .array(z.object({ name: z.string(), in: z.string() }))
        .optional(),
      requestBody: z
        .object({
          description: z.string().optional(),
          content: z.record(z.string(), z.record(z.string(), z.unknown())),
          required: z.boolean().optional(),
        })
        .optional(),
      summary: z.string().optional(),
    }
  );

  const { metadata } = apiEmbeddedContent;

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
  return Object.values(content)[0].schema as JSONSchema4Object;
}
