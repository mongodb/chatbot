import {
  References,
  SomeMessage,
  SystemMessage,
  DataStreamer,
  UserMessage,
  AssistantMessage,
  ToolMessage,
} from "mongodb-rag-core";
import { z } from "zod";
import { GenerateResponse } from "./GenerateResponse";
import {
  CoreAssistantMessage,
  CoreMessage,
  LanguageModel,
  StepResult,
  streamText,
  Tool,
  ToolCallPart,
  ToolChoice,
  ToolExecutionOptions,
  ToolResultUnion,
  ToolSet,
} from "mongodb-rag-core/aiSdk";
import { FilterPreviousMessages } from "./FilterPreviousMessages";
import { InputGuardrail, withAbortControllerGuardrail } from "./InputGuardrail";
import { strict as assert } from "assert";
import { MakeReferenceLinksFunc } from "./MakeReferenceLinksFunc";
import { makeDefaultReferenceLinks } from "./makeDefaultReferenceLinks";

export const SEARCH_TOOL_NAME = "search_content";

export type SearchToolReturnValue = {
  content: {
    url: string;
    text: string;
    metadata?: Record<string, unknown>;
  }[];
};

export type SearchTool<ARGUMENTS extends z.ZodTypeAny> = Tool<
  ARGUMENTS,
  SearchToolReturnValue
> & {
  execute: (
    args: z.infer<ARGUMENTS>,
    options: ToolExecutionOptions
  ) => PromiseLike<SearchToolReturnValue>;
};

type SearchToolResult<ARGUMENTS extends z.ZodTypeAny> = ToolResultUnion<{
  [SEARCH_TOOL_NAME]: SearchTool<ARGUMENTS>;
}>;

export interface GenerateResponseWithSearchToolParams<
  ARGUMENTS extends z.ZodTypeAny
> {
  languageModel: LanguageModel;
  llmNotWorkingMessage: string;
  inputGuardrail?: InputGuardrail;
  systemMessage: SystemMessage;
  filterPreviousMessages?: FilterPreviousMessages;
  /**
    Required tool for performing content search and gathering {@link References}
   */
  additionalTools?: ToolSet;
  makeReferenceLinks?: MakeReferenceLinksFunc;
  maxSteps?: number;
  toolChoice?: ToolChoice<{ search_content: SearchTool<ARGUMENTS> }>;
  searchTool: SearchTool<ARGUMENTS>;
}

/**
  Generate chatbot response using RAG and a search tool named {@link SEARCH_TOOL_NAME}.
 */
export function makeGenerateResponseWithSearchTool<
  ARGUMENTS extends z.ZodTypeAny
>({
  languageModel,
  llmNotWorkingMessage,
  inputGuardrail,
  systemMessage,
  filterPreviousMessages,
  additionalTools,
  makeReferenceLinks,
  maxSteps = 2,
  searchTool,
  toolChoice,
}: GenerateResponseWithSearchToolParams<ARGUMENTS>): GenerateResponse {
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

      const toolSet = {
        [SEARCH_TOOL_NAME]: searchTool,
        ...(additionalTools ?? {}),
      } satisfies ToolSet;

      const generationArgs = {
        model: languageModel,
        messages: [
          systemMessage,
          ...filteredPreviousMessages,
          userMessage,
        ] satisfies CoreMessage[],
        tools: toolSet,
        toolChoice,
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

      const references: any[] = [];
      const { result, guardrailResult } = await withAbortControllerGuardrail(
        async (controller) => {
          // Pass the tools as a separate parameter
          const { fullStream, steps, text } = streamText({
            ...generationArgs,
            abortSignal: controller.signal,
            onStepFinish: async ({ toolResults }) => {
              toolResults?.forEach(
                (toolResult: SearchToolResult<ARGUMENTS>) => {
                  if (
                    toolResult.toolName === SEARCH_TOOL_NAME &&
                    toolResult.result.content
                  ) {
                    // Map the search tool results to the References format
                    const searchResults = toolResult.result
                      .content as SearchToolResult<ARGUMENTS>["result"]["content"];
                    const referencesToAdd = searchResults.map(
                      (item: {
                        url: string;
                        text: string;
                        metadata?: Record<string, unknown>;
                      }) => ({
                        url: item.url,
                        text: item.text,
                        metadata: item.metadata,
                      })
                    );
                    references.push(...referencesToAdd);
                  }
                }
              );
            },
          });
          if (shouldStream) {
            assert(dataStreamer, "dataStreamer is required for streaming");
            for await (const chunk of fullStream) {
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
                  console.error("Error in stream:", chunk.error);
                  throw new Error(
                    typeof chunk.error === "string"
                      ? chunk.error
                      : String(chunk.error)
                  );
                default:
                  break;
              }
            }
          }

          try {
            // Transform filtered references to include the required title property
            const referencesOut = makeReferenceLinks
              ? makeReferenceLinks(references)
              : makeDefaultReferenceLinks(references);
            dataStreamer?.streamData({
              data: referencesOut,
              type: "references",
            });
            const stepResults = await steps;
            const finalText = await text; // Await the text promise

            return {
              stepResults,
              references: referencesOut,
              text: finalText, // Include the final text response as a string
            } satisfies {
              stepResults: StepResult<typeof toolSet>[];
              references: References;
              text: string; // Update type definition
            };
          } catch (error: unknown) {
            console.error("Error in stream:", error);
            throw new Error(typeof error === "string" ? error : String(error));
          }
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
// TODO: somewhere in here, it's taking the tool call results, and formatting them as normal assistant messages, which is confusing the model in subsequent genrations
// see https://www.braintrust.dev/app/mongodb-education-ai/p/chatbot-responses-dev/logs?r=682fadec303d9ec3dcc510bf&s=52058b8a-ad63-4628-8ecd-07b43c747cd4
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

/**
  Generate the final messages to send to the user based on guardrail result and text generation result
 */
function handleReturnGeneration<TOOLS extends ToolSet>(
  userMessage: UserMessage,
  guardrailResult:
    | { rejected: boolean; message: string; metadata?: Record<string, unknown> }
    | undefined,
  textGenerationResult:
    | {
        stepResults?: StepResult<TOOLS>[];
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
      ...stepResultsToMessages<TOOLS>(
        textGenerationResult.stepResults,
        textGenerationResult.references
      ),
      {
        role: "assistant",
        content: textGenerationResult.text || "",
        references: textGenerationResult.references,
        customData,
      },
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
        content: [
          {
            type: "tool-call",
            toolCallId: message.toolCall.id,
            toolName: message.toolCall.function.name,
            args: message.toolCall.function.arguments,
          } satisfies ToolCallPart,
        ],
      } satisfies CoreAssistantMessage;
    } else {
      // Fallback for other object content
      return {
        role: "assistant",
        content: JSON.stringify(message.content),
      } satisfies CoreAssistantMessage;
    }
  } else if (message.role === "tool") {
    // Convert tool messages to the format expected by the AI SDK
    return {
      role: "assistant", // Use assistant role instead of function
      content:
        typeof message.content === "string"
          ? message.content
          : JSON.stringify(message.content),
    } satisfies CoreMessage;
  } else {
    // User and system messages can pass through
    return message satisfies CoreMessage;
  }
}
