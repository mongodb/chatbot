import { FunctionDefinition, GetChatCompletionsOptions } from "@azure/openai";
import "dotenv/config";
import { OpenAIClient } from "@azure/openai";
import {
  ChatLlm,
  LlmAnswerQuestionParams,
  OpenAiChatMessage,
  SystemPrompt,
} from "./ChatLlm";

export type GenerateUserPrompt = ({
  question,
  chunks,
}: {
  question: string;
  chunks: string[];
}) => OpenAiChatMessage & { role: "user" };
export interface MakeOpenAiChatLlmParams {
  deployment: string;
  openAiClient: OpenAIClient;
  openAiLmmConfigOptions: GetChatCompletionsOptions;
  generateUserPrompt: GenerateUserPrompt;
  systemPrompt: SystemPrompt;
}

export function makeOpenAiChatLlm({
  deployment,
  openAiClient,
  openAiLmmConfigOptions,
  generateUserPrompt,
  systemPrompt,
}: MakeOpenAiChatLlmParams): ChatLlm {
  return {
    // NOTE: for example streaming data, see https://github.com/openai/openai-node/issues/18#issuecomment-1369996933
    async answerQuestionStream({ messages, chunks }: LlmAnswerQuestionParams) {
      const messagesForLlm = prepConversationForOpenAiLlm({
        messages,
        chunks,
        generateUserPrompt,
        systemPrompt,
      });
      const completionStream = await openAiClient.listChatCompletions(
        deployment,
        messagesForLlm,
        {
          ...openAiLmmConfigOptions,
          stream: true,
        }
      );
      return completionStream;
    },
    async answerQuestionAwaited({ messages, chunks }: LlmAnswerQuestionParams) {
      const messagesForLlm = prepConversationForOpenAiLlm({
        messages,
        chunks,
        generateUserPrompt,
        systemPrompt,
      });
      const {
        choices: [choice],
      } = await openAiClient.getChatCompletions(
        deployment,
        messagesForLlm,
        openAiLmmConfigOptions
      );

      const { message } = choice;
      if (!message) {
        throw new Error("No message returned from OpenAI");
      }
      return message as OpenAiChatMessage;
    },
  };
}

function prepConversationForOpenAiLlm({
  messages,
  chunks,
  generateUserPrompt,
  systemPrompt,
}: LlmAnswerQuestionParams & {
  generateUserPrompt: GenerateUserPrompt;
  systemPrompt: SystemPrompt;
}): OpenAiChatMessage[] {
  validateOpenAiConversation(messages, systemPrompt);
  const lastMessage = messages[messages.length - 1];
  const newestMessageForLlm = generateUserPrompt({
    question: lastMessage.content,
    chunks,
  });
  return [...messages.slice(0, -1), newestMessageForLlm];
}

function validateOpenAiConversation(
  messages: OpenAiChatMessage[],
  systemPrompt: SystemPrompt
) {
  if (messages.length === 0) {
    throw new Error("No messages provided");
  }
  const firstMessage = messages[0];
  if (
    firstMessage.content !== systemPrompt.content ||
    firstMessage.role !== systemPrompt.role
  ) {
    throw new Error(
      `First message must be system prompt: ${JSON.stringify(systemPrompt)}`
    );
  }
  if (messages.length < 2) {
    throw new Error("No user message provided");
  }
  const secondMessage = messages[1];
  if (secondMessage.role !== "user") {
    throw new Error("Second message must be user message");
  }
  if (messages.length > 2) {
    const secondToLastMessage = messages[messages.length - 2];
    const lastMessage = messages[messages.length - 1];

    if (secondToLastMessage.role === lastMessage.role) {
      throw new Error(`Messages must alternate roles`);
    }

    if (lastMessage.role !== "user") {
      throw new Error("Last message must be user message");
    }
  }
}

function makeApiChat(
  openAiClient: OpenAIClient,
  deploymentName: string,
  systemPromptPersonality: string,
  findApiSpecActionFunc: (params: unknown) => unknown
) {
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
        },
      },
      function: findApiSpecActionFunc,
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
      const functions = availableFunctions.map((f) => f.definition);
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
        functions: functions,
        functionCall: "auto",
      };
      let responseAvailableFunctions = [...functions];
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
        return {
          newMessages,
          availableFunctions: responseAvailableFunctions,
        };
      }
    },
  };
}

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

export interface LlmFunction {
  definition: FunctionDefinition;
  function: (params: unknown) => unknown;
  dynamic?: boolean;
  name: string;
}
