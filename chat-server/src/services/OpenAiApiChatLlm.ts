/**
  @fileoverview This file contains the implementation of {@link ApiChatLlm} using the OpenAI ChatGPT API.
 */
import {
  OpenAIClient,
  GetChatCompletionsOptions,
  ChatMessage,
  ChatCompletions,
  FunctionDefinition,
} from "@azure/openai";
import { strict as assert } from "assert";
import { OpenAiChatMessage } from "./ChatLlm";
import { ApiChatLlm, ApiChatLlmAnswerAwaitedParams } from "./ApiChatLlm";
import { HttpApiCredentials, HttpRequestArgs } from "./HttpRequestArgs";
import yaml from "yaml";
import { FindContentFunc } from "../lib";
import { makeFunctionMetadataContent } from "./makePersistedHttpRequestFunctionDefinition";
import { executeCurlRequest } from "./executeCurlRequest";

interface OpenAiApiChatParams {
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
    "You are a friendly chatbot that can answer questions about the MongoDB Atlas API spec."
    */
  systemPromptPersonality: string;
  /**
    Function to find an action in the API spec
    */
  findContent: FindContentFunc;
}

export const baseOpenAiFunctionDefinitions: FunctionDefinition[] = [
  {
    name: "find_api_spec_action",
    description: "Find an action in the API spec",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Repeat the user's query to perform a search for the relevant action",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "make_curl_request",
    description: `Make a curl request to an endpoint based on the available relevant information in the conversation
ALWAYS USE HTTP digest authentication.
Check the system prompt for relevant additional information, like \`groupId\` and \`clusterName\`.

Keep the "--user {username}:{password}", the system will fill it in later.

Example curl request:
curl --user "{username}:{password}" \
  --digest \
  --header "Accept: application/vnd.atlas.2023-02-01+json" \
  -X GET "https://cloud.mongodb.com/api/atlas/v2/groups/{groupId}/dbAccessHistory/clusters/{clusterName}"`,
    parameters: {
      type: "object",
      properties: {
        curl_request: {
          type: "string",
          description: `The curl request to make to the API endpoint.`,
        },
      },
      required: ["curl_request"],
    },
  },
];

/**
    Constructs a LLM chatbot that can use an API spec to answer questions.
   */
export function makeOpenAiApiChatLlm({
  openAiClient,
  deploymentName,
  systemPromptPersonality,
  findContent,
}: OpenAiApiChatParams): ApiChatLlm {
  // // SKUNK_TODO: we'll probably want to modify the system prompt.
  const baseSystemPrompt = `${systemPromptPersonality}
  Use the find_api_spec_action function to find an action in the API spec when the user asks you to perform an action.
  If none of the available functions match the user's query, use this function.
  Before performing an action, ask the user for any missing **required** parameters.
  Before performing a POST, DELETE, PUT, or PATCH function, ask the user to confirm that they want to perform the action.
  `;

  return {
    baseSystemPrompt,
    async answerAwaited({
      query,
      messages,
      options,
      staticHttpRequestArgs,
      apiCredentials,
    }: ApiChatLlmAnswerAwaitedParams) {
      // Update the conversation with the new system prompt based on the current available functions
      let newMessages = updateConversationWithNewSystemPrompt({
        baseSystemPrompt,
        messages,
        query,
        staticHttpRequestArgs,
      });

      // Construct the LLM options, including the available functions
      const messageOptions: GetChatCompletionsOptions = {
        ...options,
        functions: baseOpenAiFunctionDefinitions,
        functionCall: "auto",
      };
      const messagesForOpenAi = newMessages.map(
        ({ content, role, name, functionCall }) => ({
          content,
          role,
          name,
          functionCall,
        })
      );

      // Get initial response from the LLM to the user's query.
      // The response can be one of the following:
      // - A text message to return to the user
      // - A function call to make
      const response = await openAiClient.getChatCompletions(
        deploymentName,
        messagesForOpenAi,
        messageOptions
      );
      const responseMessage = getChatMessageFromOpenAiResponse(response);

      // Enter this logic when the LLM has determined to make a function call.
      // We must:
      // 1. Process the function call
      // 2. Append relevant message(s) to the conversation based on the function call
      // 3. Update the functions available to the conversation.
      if (responseMessage.functionCall !== undefined) {
        newMessages = await handleOpenAiFunctionCall({
          responseMessage,
          newMessages,
          findContent,
          credentials: apiCredentials,
          staticHttpRequestArgs,
        });
      } else {
        // If the LLM has not made a function call, we simply append the response message to the conversation.
        newMessages.push({
          ...(responseMessage as Omit<OpenAiChatMessage, "functions">),
        });
      }
      return {
        newMessages,
      };
    },
  };
}

/**
  Helper function to get chat messages from the ChatGPT API response {@link ChatCompletions} object.
 */
function getChatMessageFromOpenAiResponse(
  chatChatCompletions: ChatCompletions
): ChatMessage {
  const { choices } = chatChatCompletions;
  if (choices[0] === undefined || choices[0].message === undefined) {
    throw new Error("No message returned from OpenAI API");
  }
  return choices[0].message;
}

/**
  Helper function to rebuild the conversation with the updated system prompt.
 */
function updateConversationWithNewSystemPrompt({
  baseSystemPrompt,
  messages,
  query,
  staticHttpRequestArgs,
}: {
  baseSystemPrompt: string;
  messages: OpenAiChatMessage[];
  query?: string;
  staticHttpRequestArgs?: HttpRequestArgs;
}) {
  const currentMessages = [
    {
      role: "system",
      content: makeSystemPrompt(baseSystemPrompt, staticHttpRequestArgs),
    },
    ...messages.filter((message) => message.role !== "system"),
  ] satisfies OpenAiChatMessage[];
  if (query) {
    currentMessages.push({
      role: "user",
      content: query,
    });
  }
  return currentMessages;
}

/**
  Construct system prompt for the LLM on each request.
  This helps the LLM know what to do with the dynamically added functions.
  @param baseSystemPrompt - System prompt for all LLM requests. Includes the personality and general instructions.
  @param currentFunctions - Information about additional functions available for the LLM to call.
  @returns string - the system prompt for the LLM
 */
export function makeSystemPrompt(
  baseSystemPrompt: string,
  staticHttpRequestArgs?: HttpRequestArgs
) {
  let systemPrompt = baseSystemPrompt;
  if (staticHttpRequestArgs) {
    systemPrompt += "\n" + makeUserSystemPromptContext(staticHttpRequestArgs);
  }
  return systemPrompt;
}

/**
  Add HTTP request specific information to the system prompt,
  as provided by the user before the conversation started.
  */
function makeUserSystemPromptContext(
  staticHttpRequestArgs: HttpRequestArgs
): string {
  return `The following information is available for you to use for calling functions.
Use this information before asking the user for more information.
${
  staticHttpRequestArgs.headers
    ? "Headers:\n" + yaml.stringify(staticHttpRequestArgs.headers).trim() + "\n"
    : ""
}${
    staticHttpRequestArgs.body
      ? "Request body:\n" +
        yaml.stringify(staticHttpRequestArgs.body).trim() +
        "\n"
      : ""
  }${
    staticHttpRequestArgs.pathParameters
      ? "Path parameters:\n" +
        yaml.stringify(staticHttpRequestArgs.pathParameters).trim() +
        "\n"
      : ""
  }${
    staticHttpRequestArgs.queryParameters
      ? "Query parameters:\n" +
        yaml.stringify(staticHttpRequestArgs.queryParameters).trim() +
        "\n"
      : ""
  }
  `.trimEnd();
}

/**
  Helper function to handle the LLM's function call.

  Chooses between the following function actions:

  - Make a call to one of the dynamic functions, which calls the relevant API endpoint
    and then appends the "function" message to the conversation.
  - Make a call to the find_api_spec_action function, which performs vector search
    to add the relevant API action to the set of available options.
 */
async function handleOpenAiFunctionCall({
  responseMessage,
  newMessages,
  findContent,
  credentials,
  staticHttpRequestArgs,
}: {
  responseMessage: ChatMessage;
  newMessages: OpenAiChatMessage[];
  findContent: FindContentFunc;
  credentials: HttpApiCredentials;
  staticHttpRequestArgs?: HttpRequestArgs;
}) {
  assert(
    responseMessage.functionCall,
    "No function call returned from OpenAI. This function should only be called if it's validated that the response message has the `functionCall` property."
  );
  const { name } = responseMessage.functionCall;

  // The LLM has chosen to find action(s) in the API spec.
  // We add the action(s) to the set of available functions.
  if (name === "find_api_spec_action") {
    const { query } = JSON.parse(responseMessage.functionCall.arguments);
    // Call function to find relevant action(s) in the API spec
    // and add them to the set of available actions
    const { content: apiSpecActions } = await findContent({
      query,
      ipAddress: "FOO",
    });

    newMessages.push(responseMessage as OpenAiChatMessage, {
      role: "function",
      name: "find_api_spec_action",
      content: makeFunctionMetadataContent(apiSpecActions[0]),
    });
  } else if (name === "make_curl_request") {
    const { curl_request } = JSON.parse(responseMessage.functionCall.arguments);
    const response = await executeCurlRequest(
      curl_request,
      credentials,
      staticHttpRequestArgs
    );
    newMessages.push(responseMessage as OpenAiChatMessage, {
      role: "function",
      name: "make_curl_request",
      content: `The API responded with:\n\n` + response,
    });
  }
  return newMessages;
}
