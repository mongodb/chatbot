/**
  @fileoverview This file contains the implementation of ApiChatLlm using the OpenAI ChatGPT API.
 */
import {
  OpenAIClient,
  GetChatCompletionsOptions,
  FunctionDefinition,
} from "@azure/openai";
import { OpenAiChatMessage } from "./ChatLlm";
import { ApiEmbeddedContent } from "chat-core";
import { LlmFunction } from "./LlmFunction";
import { ApiChatLlm, ApiChatLlmAnswerAwaitedParams } from "./ApiChatLlm";

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

export const baseOpenAiFunctionDefinitions: FunctionDefinition[] = [
  {
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
  {
    name: "clear_api_spec_actions",
    description: "Clear the API spec actions for the set of available actions",
    parameters: {
      type: "object",
      properties: {
        clear: "boolean",
      },
      required: ["clear"],
    },
  },
];

/**
    Constructs a chatbot that can use an API spec to answer questions.
   */
export function makeOpenAiApiChat<T = Record<string, unknown>>({
  openAiClient,
  deploymentName,
  systemPromptPersonality,
  findApiSpecAction,
}: OpenAiApiChatParams<T>): ApiChatLlm {
  const baseSystemPrompt = `${systemPromptPersonality}
  Use the find_api_spec_action function to find an action in the API spec when the user asks you to perform an action.
  If none of the available functions match the user's query, use this function.
  Use the clear_api_spec_actions function to clear the API spec actions for the set of available actions.
  Do this when a user wants to perform a new action from the action
  `;
  const baseFunctions: LlmFunction[] = [
    {
      name: "find_api_spec_action",
      definition: baseOpenAiFunctionDefinitions.find(
        (f) => f.name === "find_api_spec_action"
      ) as FunctionDefinition,
      function: findApiSpecAction,
    },
    {
      name: "clear_api_spec_actions",
      definition: baseOpenAiFunctionDefinitions.find(
        (f) => f.name === "clear_api_spec_actions"
      ) as FunctionDefinition,
      function: () => {
        return baseFunctions;
      },
    },
  ];

  return {
    // SKUNK_TODO: The logic here probably isn't completely correct, and should likely be abstracted into some helper methods
    // this is just a sketch of ideas.
    async answerAwaited({
      query,
      messages,
      availableFunctions,
      options,
    }: ApiChatLlmAnswerAwaitedParams) {
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - SKUNK_TODO: deal with this
        newMessages.push(responseBasedOnFunction.choices[0].message);
      }
      const availableFunctionDefinitions = responseAvailableFunctions.map(
        (f) => f.definition
      );
      return {
        newMessages,
        availableFunctionDefinitions,
      };
    },
  };
}

/**
 * Construct system prompt for the LLM on each request.
 * @param baseSystemPrompt - System prompt for all LLM requests. Includes the personality and general instructions.
 * @param currentFunctions - Information about additional functions available for the LLM to call.
 * @returns string - the system prompt for the LLM
 */
export function makeSystemPrompt(
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
