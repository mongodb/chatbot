import {
  References,
  SomeMessage,
  SystemMessage,
  UserMessage,
  AssistantMessage,
  ToolMessage,
  EmbeddedContent,
} from "mongodb-rag-core";
import { z } from "zod";
import { GenerateResponse } from "./GenerateResponse";
import {
  CoreAssistantMessage,
  CoreMessage,
  LanguageModel,
  streamText,
  Tool,
  ToolCallPart,
  ToolChoice,
  ToolExecutionOptions,
  ToolResultUnion,
  ToolSet,
  CoreToolMessage,
} from "mongodb-rag-core/aiSdk";
import { FilterPreviousMessages } from "./FilterPreviousMessages";
import { InputGuardrail, withAbortControllerGuardrail } from "./InputGuardrail";
import { strict as assert } from "assert";
import { MakeReferenceLinksFunc } from "./MakeReferenceLinksFunc";
import { makeDefaultReferenceLinks } from "./makeDefaultReferenceLinks";
import { SearchResult } from "./SearchResult";

export const SEARCH_TOOL_NAME = "search_content";

export type SearchToolReturnValue = {
  content: SearchResult[];
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
  makeReferenceLinks = makeDefaultReferenceLinks,
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
    if (shouldStream) {
      assert(dataStreamer, "dataStreamer is required for streaming");
    }
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

      // TODO: EAI-995: validate that this works as part of guardrail changes
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
          // Pass the tools as a separate parameter
          const result = streamText({
            ...generationArgs,
            // Abort the stream if the guardrail AbortController is triggered
            abortSignal: controller.signal,
            // Add the search tool results to the references
            onStepFinish: async ({ toolResults }) => {
              toolResults?.forEach(
                (toolResult: SearchToolResult<ARGUMENTS>) => {
                  if (
                    toolResult.toolName === SEARCH_TOOL_NAME &&
                    toolResult.result.content
                  ) {
                    // Map the search tool results to the References format
                    const searchResults = toolResult.result.content;
                    references.push(...makeReferenceLinks(searchResults));
                  }
                }
              );
            },
          });

          for await (const chunk of result.fullStream) {
            switch (chunk.type) {
              case "text-delta":
                if (shouldStream) {
                  dataStreamer?.streamData({
                    data: chunk.textDelta,
                    type: "delta",
                  });
                }
                break;
              case "tool-call":
                // do nothing with tool calls for now...
                break;
              case "error":
                throw new Error(
                  typeof chunk.error === "string"
                    ? chunk.error
                    : String(chunk.error)
                );
              default:
                break;
            }
          }
          try {
            // Transform filtered references to include the required title property

            dataStreamer?.streamData({
              data: references,
              type: "references",
            });
            return result;
          } catch (error: unknown) {
            throw new Error(typeof error === "string" ? error : String(error));
          }
        },
        inputGuardrailPromise
      );
      const text = await result?.text;
      assert(text, "text is required");
      const messages = (await result?.response)?.messages;
      assert(messages, "messages is required");

      return handleReturnGeneration({
        userMessage,
        guardrailResult,
        messages,
        customData,
        references,
      });
    } catch (error: unknown) {
      dataStreamer?.streamData({
        data: llmNotWorkingMessage,
        type: "delta",
      });
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

type ResponseMessage = CoreAssistantMessage | CoreToolMessage;

/**
  Generate the final messages to send to the user based on guardrail result and text generation result
 */
function handleReturnGeneration({
  userMessage,
  guardrailResult,
  messages,
  references,
}: {
  userMessage: UserMessage;
  guardrailResult:
    | { rejected: boolean; message: string; metadata?: Record<string, unknown> }
    | undefined;
  messages: ResponseMessage[];
  references?: References;
  customData?: Record<string, unknown>;
}): { messages: SomeMessage[] } {
  userMessage.rejectQuery = guardrailResult?.rejected;
  userMessage.customData = {
    ...userMessage.customData,
    ...guardrailResult,
  };
  return {
    messages: [
      userMessage,
      ...formatMessageForGeneration(messages, references ?? []),
    ] satisfies SomeMessage[],
  };
}

function formatMessageForGeneration(
  messages: ResponseMessage[],
  references: References
): SomeMessage[] {
  const messagesOut = messages
    .map((m) => {
      if (m.role === "assistant") {
        const baseMessage: Partial<AssistantMessage> & { role: "assistant" } = {
          role: "assistant",
        };
        if (typeof m.content === "string") {
          baseMessage.content = m.content;
        } else {
          m.content.forEach((c) => {
            if (c.type === "text") {
              baseMessage.content = c.text;
            }
            if (c.type === "tool-call") {
              baseMessage.toolCall = {
                id: c.toolCallId,
                function: {
                  name: c.toolName,
                  arguments: JSON.stringify(c.args),
                },
                type: "function",
              };
            }
          });
        }

        return {
          ...baseMessage,
          content: baseMessage.content ?? "",
        } satisfies AssistantMessage;
      } else if (m.role === "tool") {
        const baseMessage: Partial<ToolMessage> & { role: "tool" } = {
          role: "tool",
        };
        if (typeof m.content === "string") {
          baseMessage.content = m.content;
        } else {
          m.content.forEach((c) => {
            if (c.type === "tool-result") {
              baseMessage.name = c.toolName;
              baseMessage.content = JSON.stringify(c.result);
            }
          });
        }
        return {
          ...baseMessage,
          name: baseMessage.name ?? "",
          content: baseMessage.content ?? "",
        } satisfies ToolMessage;
      }
    })
    .filter((m): m is AssistantMessage | ToolMessage => m !== undefined);
  const latestMessage = messagesOut.at(-1);
  if (latestMessage?.role === "assistant") {
    latestMessage.references = references;
  }
  return messagesOut;
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
