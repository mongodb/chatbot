import { FunctionDefinition } from "@azure/openai";
import { EmbeddedContent } from "chat-core";
import { PersistedHttpRequestFunctionDefinition } from "./PersistedFunctionDefinition";

/**
  Constructs a {@link FunctionDefinition} for LLM to call based on an {@link EmbeddedContent}.
 */
export function makePersistedHttpRequestFunctionDefinition(
    apiEmbeddedContent: EmbeddedContent
): PersistedHttpRequestFunctionDefinition {
    return {
        // Function definition used by ChatGPT
        definition: {
            name: "GetAtlasAdminApiInfo",
            description: "Retrieve information from the Atlas Admin API",
            parameters: {
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "API path",
                    },
                    "baseUrl": {
                        "type": "string",
                        "description": "Base URL of the API",
                    },
                    "description": {
                        "type": "string",
                        "description": "Description of API",
                    },
                    "method": {
                        "type": "string",
                        "description": "HTTP verb associated with the API",
                    },
                },
                "required": ["path", "description", "method"],
            },
        },
        // Data used by the application
        httpVerb: apiEmbeddedContent.metadata.method,
        path: apiEmbeddedContent.metadata.path,
    };
}