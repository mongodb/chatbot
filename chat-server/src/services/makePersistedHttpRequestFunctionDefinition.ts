import { FunctionDefinition } from "@azure/openai";
import { EmbeddedContent, HttpVerb } from "chat-core";
import { PersistedHttpRequestFunctionDefinition } from "./PersistedFunctionDefinition";

// TODO: refactor
/**
  Constructs a {@link FunctionDefinition} for LLM to call based on an {@link EmbeddedContent}.
 */
export function makePersistedHttpRequestFunctionDefinition(
  apiEmbeddedContent: EmbeddedContent
): PersistedHttpRequestFunctionDefinition {
  if (apiEmbeddedContent.metadata?.method === undefined) {
    throw new Error("API method is undefined");
  }
  return {
    // Function definition used by ChatGPT
    definition: {
      name: "GetAtlasAdminApiInfo",
      description: "Retrieve information from the Atlas Admin API",
      parameters: {
        type: "object",
        properties: {
          // TODO: build this out
        },
      },
    },
    // Data used by the application
    httpVerb: apiEmbeddedContent.metadata.method as HttpVerb,
    path: apiEmbeddedContent.metadata.path as string,
  };
}
