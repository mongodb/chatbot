import { FunctionDefinition } from "@azure/openai";
import { ApiEmbeddedContent } from "chat-core";

/**
    Constructs a {@link FunctionDefinition} for LLM to call based on an {@link ApiEmbeddedContent}.
   */
// SKUNK_TODO: make this
export function makeLlmFunction(
  apiEmbeddedContent: ApiEmbeddedContent
): FunctionDefinition {
  return {
    name: "TODO",
    description: "TODO",
    parameters: {},
  };
}
