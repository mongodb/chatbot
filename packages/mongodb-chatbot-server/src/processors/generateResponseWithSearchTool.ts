import {
  References,
  SomeMessage,
  SystemMessage,
  FindContentResult,
  DataStreamer,
  UserMessage,
  AssistantMessage,
  EmbeddedContent,
} from "mongodb-rag-core";
import { z } from "zod";
import { GenerateResponse } from "../routes/conversations/addMessageToConversation";
import {
  CoreAssistantMessage,
  CoreMessage,
  CoreSystemMessage,
  CoreToolMessage,
  CoreUserMessage,
  LanguageModel,
  StepResult,
  streamText,
  TextStreamPart,
  Tool,
  ToolCallUnion,
  ToolResult,
  ToolResultPart,
  ToolSet,
} from "mongodb-rag-core/aiSdk";
import { FilterPreviousMessages } from "./FilterPreviousMessages";
import { InputGuardrail, withAbortControllerGuardrail } from "./InputGuardrail";
import { strict as assert } from "assert";
import { MakeReferenceLinksFunc } from "./MakeReferenceLinksFunc";
import { makeDefaultReferenceLinks } from "./makeDefaultReferenceLinks";
import { text } from "express";
export interface GenerateResponseWithSearchToolParams {
  languageModel: LanguageModel;
  llmNotWorkingMessage: string;
  noRelevantContentMessage: string;
  inputGuardrail?: InputGuardrail;
  systemMessage: SystemMessage;
  filterPreviousMessages?: FilterPreviousMessages;
  /**
    Required tool for performing content search and gathering {@link References}
   */
  searchTool: SearchTool;
  additionalTools?: ToolSet;
  makeReferenceLinks?: MakeReferenceLinksFunc;
  maxSteps?: number;
}

export const SEARCH_TOOL_NAME = "search_content";

export const DefaultSearchArgsSchema = z.object({ query: z.string() });
export type SearchArguments = z.infer<typeof DefaultSearchArgsSchema>;

export type SearchToolReturnValue = {
  content: {
    url: string;
    text: string;
    metadata?: Record<string, unknown>;
  }[];
};
export type SearchTool = Tool<
  typeof DefaultSearchArgsSchema,
  SearchToolReturnValue
>;

export type SearchToolResult = ToolResult<
  typeof SEARCH_TOOL_NAME,
  SearchArguments,
  SearchToolReturnValue
>;

/**
  Generate chatbot response using RAG and a search tool named {@link SEARCH_TOOL_NAME}.
 */
export function makeGenerateResponseWithSearchTool({
  languageModel,
  llmNotWorkingMessage,
  inputGuardrail,
  systemMessage,
  filterPreviousMessages,
  searchTool,
  additionalTools,
  makeReferenceLinks,
  maxSteps = 2,
}: GenerateResponseWithSearchToolParams): GenerateResponse {
  return async function generateResponseWithSearchTool({
    conversation,
    latestMessageText,
    clientContext,
    customData,
    shouldStream,
    reqId,
    dataStreamer,
    request,
  }) {
    const userMessage = {
      role: "user",
      content: latestMessageText,
    } satisfies UserMessage;
    try {
      // Get preceding messages to include in the LLM prompt
      const filteredPreviousMessages = filterPreviousMessages
        ? (await filterPreviousMessages(conversation)).map(
            formatMessageForAiSdk
          )
        : [];

      const generationArgs = {
        model: languageModel,
        messages: [
          systemMessage,
          ...filteredPreviousMessages,
          userMessage,
        ] as CoreMessage[],
        tools: {
          [SEARCH_TOOL_NAME]: searchTool,
          ...(additionalTools ?? {}),
        } satisfies {
          [SEARCH_TOOL_NAME]: SearchTool;
        },
        maxSteps,
      };

      // Guardrail used to validate the input
      // while the LLM is generating the response
      const inputGuardrailPromise = inputGuardrail
        ? inputGuardrail({
            conversation,
            latestMessageText,
            clientContext,
            customData,
            shouldStream,
            reqId,
            dataStreamer,
            request,
          })
        : undefined;

      const references: References = [];
      const { result, guardrailResult } = await withAbortControllerGuardrail(
        async (controller) => {
          const toolDefinitions = {
            [SEARCH_TOOL_NAME]: searchTool,
            ...(additionalTools ?? {}),
          };

          // Pass the tools as a separate parameter
          const { fullStream, steps } = streamText({
            ...generationArgs,
            abortSignal: controller.signal,
            tools: toolDefinitions,
            onStepFinish: async ({ stepType, toolResults }) => {
              // Add tool results to references
              if (stepType === "tool-result") {
                toolResults?.forEach(
                  (
                    toolResult: ToolResult<
                      typeof SEARCH_TOOL_NAME,
                      SearchArguments,
                      SearchToolResult
                    >
                  ) => {
                    if (toolResult.toolName === SEARCH_TOOL_NAME) {
                      // TODO: logic to get references
                      const stepReferences = makeReferenceLinks(
                        extractReferencesFromStepResults(stepResults) ?? []
                      );
                      references.push(...stepReferences);
                    }
                  }
                );
              }
            },
          });
          if (shouldStream) {
            assert(dataStreamer, "dataStreamer is required for streaming");
            await handleStreamResults(fullStream, shouldStream, dataStreamer);
          }

          const stepResults = await steps;
          console.log(
            "stepResults::",
            stepResults.map((s) => ({
              type: s.stepType,
              calls: JSON.stringify(s.toolCalls),
              results: JSON.stringify(s.toolResults),
              text: s.text,
            }))
          );

          return {
            stepResults,
            references,
          };
        },
        inputGuardrailPromise
      );
      return handleReturnGeneration(
        userMessage,
        guardrailResult,
        result,
        customData,
        llmNotWorkingMessage
      );
    } catch (error: unknown) {
      // Handle other errors
      return {
        messages: [
          userMessage,
          {
            role: "assistant",
            content: llmNotWorkingMessage,
          },
        ],
      };
    }
  };
}

function stepResultsToMessages<TOOLS extends ToolSet>(
  stepResults?: StepResult<TOOLS>[],
  references?: References
): SomeMessage[] {
  if (!stepResults) {
    return [];
  }
  return stepResults
    .map((stepResult) => {
      if (stepResult.toolCalls) {
        return stepResult.toolCalls.map(
          (toolCall) =>
            ({
              role: "assistant",
              content: toolCall.args,
              toolCall: {
                function: toolCall.args,
                id: toolCall.toolCallId,
                type: "function",
              },
            } satisfies AssistantMessage)
        );
      }
      if (stepResult.toolResults) {
        return stepResult.toolResults.map(
          (toolResult) =>
            ({
              role: "tool",
              name: toolResult.toolName,
              content: toolResult.result,
            } satisfies ToolMessage)
        );
      } else {
        return {
          role: "assistant",
          content: stepResult.text,
          references,
        } satisfies AssistantMessage;
      }
    })
    .flat();
}

async function handleStreamResults(
  streamFromAiSdk: AsyncIterable<TextStreamPart<ToolSet>>,
  shouldStream: boolean,
  dataStreamer?: DataStreamer
) {
  for await (const chunk of streamFromAiSdk) {
    switch (chunk.type) {
      case "text-delta":
        if (shouldStream) {
          dataStreamer?.streamData({
            data: chunk.textDelta,
            type: "delta",
          });
        }
        break;
      case "error":
        if (shouldStream) {
          dataStreamer?.disconnect();
        }
        throw new Error(
          typeof chunk.error === "string" ? chunk.error : String(chunk.error)
        );
      default:
        break;
    }
  }
}

function extractReferencesFromStepResults<TS extends ToolSet>(
  stepResults: StepResult<TS>[]
): References {
  const references: References = [];

  for (const stepResult of stepResults) {
    if (stepResult.toolResults) {
      for (const toolResult of Object.values(stepResult.toolResults)) {
        if (
          toolResult.toolName === SEARCH_TOOL_NAME &&
          toolResult.result?.content
        ) {
          // Map the search tool results to the References format
          const searchResults = toolResult.result.content;
          const referencesToAdd = searchResults.map(
            (item: {
              url: string;
              text: string;
              metadata?: Record<string, unknown>;
            }) => ({
              url: item.url,
              title: item.text || item.url,
              metadata: item.metadata || {},
            })
          );

          references.push(...referencesToAdd);
        }
      }
    }
  }

  return references;
}

/**
  Generate the final messages to send to the user based on guardrail result and text generation result
 */
function handleReturnGeneration(
  userMessage: UserMessage,
  guardrailResult:
    | { rejected: boolean; message: string; metadata?: Record<string, unknown> }
    | undefined,
  textGenerationResult:
    | {
        stepResults?: StepResult<ToolSet>[];
        references?: References;
        text?: string;
      }
    | null
    | undefined,
  customData?: Record<string, unknown>,
  fallbackMessage = "Sorry, I'm having trouble generating a response."
): { messages: SomeMessage[] } {
  if (guardrailResult?.rejected) {
    return {
      messages: [
        userMessage,
        {
          role: "assistant",
          content: guardrailResult.message,
          metadata: guardrailResult.metadata,
          customData,
        },
      ] satisfies SomeMessage[],
    };
  }

  if (!textGenerationResult) {
    return {
      messages: [
        userMessage,
        {
          role: "assistant",
          content: fallbackMessage,
        },
      ],
    };
  }

  // Check if stepResults exist, if not but we have text, create a response with just the text
  if (!textGenerationResult.stepResults?.length && textGenerationResult.text) {
    return {
      messages: [
        userMessage,
        {
          role: "assistant",
          content: textGenerationResult.text,
          references: textGenerationResult.references,
        },
      ],
    };
  }

  return {
    messages: [
      userMessage,
      ...stepResultsToMessages(
        textGenerationResult.stepResults,
        textGenerationResult.references
      ),
    ] satisfies SomeMessage[],
  };
}
function formatMessageForAiSdk(message: SomeMessage): CoreMessage {
  if (message.role === "assistant" && typeof message.content === "object") {
    // Convert assistant messages with object content to proper format
    if (message.toolCall) {
      // This is a tool call message
      return {
        role: "assistant",
        content: "",
        function_call: {
          name: message.toolCall.id,
          arguments: JSON.stringify(message.toolCall.function),
        },
      } as CoreAssistantMessage;
    } else {
      // Fallback for other object content
      return {
        role: "assistant",
        content: JSON.stringify(message.content),
      } as CoreAssistantMessage;
    }
  } else if (message.role === "tool") {
    // Convert tool messages to the format expected by the AI SDK
    return {
      role: "assistant", // Use assistant role instead of function
      content:
        typeof message.content === "string"
          ? message.content
          : JSON.stringify(message.content),
      name: message.name, // Include the name property
    } as CoreMessage;
  } else {
    // User and system messages can pass through
    return message as CoreMessage;
  }
}
