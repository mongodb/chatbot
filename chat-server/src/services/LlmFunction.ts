import { FunctionDefinition } from "@azure/openai";

/**
  Function called by the LLM with associated metadata.
 */
export interface LlmFunction {
  /**
        Function definition for LLM
       */
  definition: FunctionDefinition;
  /**
        Callable function that takes in the arguments from the LLM function call and returns the response.
       */
  function: (...args: any[]) => any;
  /**
        `true` if the function is loaded from the embedded content,
        and can be removed from the context window by calling the `clear_api_spec_actions` function.
       */
  dynamic?: boolean;
  /**
        Name of function. Same as the `definition.name` field.
       */
  name: string;
}
