/**
  @fileoverview This file contains the implementation for the chat with API spec actions.
 */
import {
  FunctionDefinition,
  OpenAIClient,
  GetChatCompletionsOptions,
} from "@azure/openai";
import { OpenAiChatMessage } from "./ChatLlm";

// Data Models

// SKUNK_TODO: this would be the current chatbot version of the "pages" collection
// for this project.
export interface ApiPage {
  /**
    API spec
   */
  spec: Record<string, unknown>;
  name: string;
  url: string;
}

type HttpVerb =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS";

// SKUNK_TODO: make ingest functionality to bring items from API spec into DB following this type
// in new api_embedded_content collection
/**
  Type for what we store in the DB
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

/**
  Helper type for the OpenAPI endpoint definition.
  SKUNK_TODO: can probably find a type definition from a package for this.
 */
interface OpenApiEndpointDefinition {
  parameters?: Record<string, unknown>[];
  requestBody?: any;
}

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

interface OpenAiApiChatParams<T> {
  /**
    OpenAI client
   */
  openAiClient: OpenAIClient;
  /**
    OpenAI ChatGPT API deployment name
   */
  deploymentName: string;
  /**
    System prompt personality

    @example
    You are a friendly chatbot that can answer questions about the MongoDB Atlas API spec.
   */
  systemPromptPersonality: string;
  /**
    Function to find an action in the API spec when the user asks you to perform an action.
    If none of the available functions match the user's query, use this function.

    @example
    function findApiSpecActionFunc({ query }) {
      // TODO
    }
   */
  findApiSpecAction: (params: T) => ApiEmbeddedContent;
}

/**
  Constructs a chatbot that can use an API spec to answer questions.
 */
export function makeOpenAiApiChat<T = Record<string, unknown>>({
  openAiClient,
  deploymentName,
  systemPromptPersonality,
  findApiSpecAction,
}: OpenAiApiChatParams<T>) {
  const baseSystemPrompt = `${systemPromptPersonality}

Use the find_api_spec_action function to find an action in the API spec when the user asks you to perform an action.
If none of the available functions match the user's query, use this function.

Use the clear_api_spec_actions function to clear the API spec actions for the set of available actions.
Do this when a user wants to perform a new action from the action
`;
  const baseFunctions: LlmFunction[] = [
    {
      name: "find_api_spec_action",
      definition: {
        name: "find_api_spec_action",
        description: "Find an action in the API spec",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "repeat the user's query" },
          },
          required: ["query"],
        },
      },
      function: findApiSpecAction,
    },
    {
      name: "clear_api_spec_actions",
      definition: {
        name: "clear_api_spec_actions",
        description:
          "Clear the API spec actions for the set of available actions",
        parameters: {
          type: "object",
          properties: {
            clear: "boolean",
          },
          required: ["clear"],
        },
      },
      function: () => {
        return baseFunctions;
      },
    },
  ];

  return {
    async answerAwaited(
      query: string,
      messages: OpenAiChatMessage[],
      availableFunctions: LlmFunction[],
      options: GetChatCompletionsOptions
    ) {
      const newMessages = [
        {
          role: "system",
          content: makeSystemPrompt(baseSystemPrompt, availableFunctions),
        },
        ...messages.filter((message) => message.role !== "system"),
        { role: "user", content: query },
      ] satisfies OpenAiChatMessage[];
      const messageOptions: GetChatCompletionsOptions = {
        ...options,
        functions: availableFunctions.map((f) => f.definition),
        functionCall: "auto",
      };
      let responseAvailableFunctions = [...availableFunctions];
      const response = await openAiClient.getChatCompletions(
        deploymentName,
        newMessages,
        messageOptions
      );
      const { choices } = response;
      const choice = choices[0];
      if (choice.message?.functionCall) {
        const { name } = choice.message.functionCall;
        const functionToCall = availableFunctions.find(
          (f) => f.definition.name === name
        );
        if (functionToCall && functionToCall.dynamic) {
          const functionResponse = functionToCall.function(
            choice.message.functionCall.arguments
          );

          newMessages.push({
            role: "function",
            content: JSON.stringify(functionResponse),
          });
        } else if (
          functionToCall &&
          functionToCall.name === "clear_api_spec_actions"
        ) {
          responseAvailableFunctions = baseFunctions;
        } else if (
          functionToCall &&
          functionToCall.name === "find_api_spec_action"
        ) {
          // SKUNK_TODO: refactor this to have a function makeLlmFunction() that creates the LlmFunction based on the arguments
          const apiSpecAction = functionToCall.function(
            choice.message.functionCall.arguments
          );
          responseAvailableFunctions.push(apiSpecAction);
        }
        const responseBasedOnFunction = await openAiClient.getChatCompletions(
          deploymentName,
          newMessages,
          messageOptions
        );
        newMessages.push(responseBasedOnFunction.choices[0].message);
        const availableFunctionDefinitions = responseAvailableFunctions.map(
          (f) => f.definition
        );
        return {
          newMessages,
          availableFunctionDefinitions,
        };
      }
    },
  };
}

/**
  Constructs {@link FunctionDefinition} for LLM to call based on an {@link ApiEmbeddedContent}.
 */
function makeLlmFunction(
  apiEmbeddedContent: ApiEmbeddedContent
): FunctionDefinition {
  // SKUNK_TODO: make this
}

interface ExecuteApiRequestParams {
  httpVerb: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
  baseUrl: string;
  endPoint: string;
  headers: Record<string, string>;
  body: unknown;
  parameters: Record<string, unknown>;
}
/**
  Execute request to an API endpoint.
 */
async function executeApiRequest(
  params: ExecuteApiRequestParams
): Promise<unknown> {
  // SKUNK_TODO: make this..think can just wrap the axios client
  return "TODO";
}

/**
 * Construct system prompt for the LLM on each request.
 * @param baseSystemPrompt - System prompt for all LLM requests. Includes the personality and general instructions.
 * @param currentFunctions - Information about additional functions available for the LLM to call.
 * @returns string - the system prompt for the LLM
 */
function makeSystemPrompt(
  baseSystemPrompt: string,
  currentFunctions: LlmFunction[]
) {
  const dynamicFuncs = currentFunctions.filter((f) => f.dynamic);
  if (dynamicFuncs.length > 0) {
    return (
      baseSystemPrompt +
      `Call the functions ${dynamicFuncs
        .map((func) => func.definition.name)
        .join(
          ", "
        )} only when you have all necessary parameters to complete the action. If you don't yet have all the necessary information, continue asking the user for more information until you have it all.`
    );
  } else return baseSystemPrompt;
}
