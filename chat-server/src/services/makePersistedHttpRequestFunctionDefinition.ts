import { FunctionDefinition } from "@azure/openai";
import { EmbeddedContent } from "chat-core";
import { PersistedHttpRequestFunctionDefinition } from "./PersistedFunctionDefinition";

/**
    Constructs a {@link FunctionDefinition} for LLM to call based on an {@link EmbeddedContent}.
   */
// SKUNK_TODO: make this
export function makePersistedHttpRequestFunctionDefinition(
  apiEmbeddedContent: EmbeddedContent
): PersistedHttpRequestFunctionDefinition {
  return {
    // going to ChatGPT
    definition: {
      name: "TODO",
      description: "TODO",
      parameters: {},
    },
    // this stuff is used by the application
    httpVerb: "GET",
    path: "TODO",
  };
}
