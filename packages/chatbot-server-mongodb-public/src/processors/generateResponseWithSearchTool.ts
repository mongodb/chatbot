import {
  References,
  SomeMessage,
  SystemMessage,
  UserMessage,
  AssistantMessage,
  ToolMessage,
  type ResponseStreamOutputTextDone,
  type ResponseStreamOutputTextDelta,
  type ResponseStreamOutputTextAnnotationAdded,
} from "mongodb-rag-core";
import {
  CoreAssistantMessage,
  CoreMessage,
  LanguageModel,
  streamText,
  ToolCallPart,
  ToolChoice,
  ToolSet,
  CoreToolMessage,
  ToolResultPart,
  TextPart,
} from "mongodb-rag-core/aiSdk";
import { strict as assert } from "assert";
import {
  InputGuardrail,
  FilterPreviousMessages,
  MakeReferenceLinksFunc,
  makeDefaultReferenceLinks,
  GenerateResponse,
  GenerateResponseReturnValue,
  InputGuardrailResult,
  type StreamFunction,
} from "mongodb-chatbot-server";
import {
  MongoDbSearchToolArgs,
  SEARCH_TOOL_NAME,
  SearchTool,
} from "../tools/search";

export interface GenerateResponseWithSearchToolParams {
  languageModel: LanguageModel;
  llmNotWorkingMessage: string;
  llmRefusalMessage: string;
  inputGuardrail?: InputGuardrail;
  systemMessage: SystemMessage;
  filterPreviousMessages?: FilterPreviousMessages;
  /**
    Required tool for performing content search and gathering {@link References}
   */
  additionalTools?: ToolSet;
  makeReferenceLinks?: MakeReferenceLinksFunc;
  maxSteps?: number;
  toolChoice?: ToolChoice<{
    search_content: SearchTool;
  }>;
  searchTool: SearchTool;
  stream?: {
    onLlmNotWorking: StreamFunction<{ notWorkingMessage: string }>;
    onLlmRefusal: StreamFunction<{ refusalMessage: string }>;
    onReferenceLinks: StreamFunction<{ references: References }>;
    onTextDelta: StreamFunction<{ delta: string }>;
    onTextDone?: StreamFunction<{ text: string }>;
  };
}

export const addMessageToConversationStream: GenerateResponseWithSearchToolParams["stream"] =
  {
    onLlmNotWorking({ dataStreamer, notWorkingMessage }) {
      dataStreamer?.streamData({
        type: "delta",
        data: notWorkingMessage,
      });
    },
    onLlmRefusal({ dataStreamer, refusalMessage }) {
      dataStreamer?.streamData({
        type: "delta",
        data: refusalMessage,
      });
    },
    onReferenceLinks({ dataStreamer, references }) {
      dataStreamer?.streamData({
        type: "references",
        data: references,
      });
    },
    onTextDelta({ dataStreamer, delta }) {
      dataStreamer?.streamData({
        type: "delta",
        data: delta,
      });
    },
  };

export const responsesApiStream: GenerateResponseWithSearchToolParams["stream"] =
  {
    onLlmNotWorking({ dataStreamer, notWorkingMessage }) {
      dataStreamer?.streamResponses({
        type: "response.output_text.delta",
        delta: notWorkingMessage,
        content_index: 0,
        output_index: 0,
        item_id: "",
      } satisfies ResponseStreamOutputTextDelta);
      dataStreamer?.streamResponses({
        type: "response.output_text.done",
        text: notWorkingMessage,
        content_index: 0,
        output_index: 0,
        item_id: "",
      } satisfies ResponseStreamOutputTextDone);
    },
    onLlmRefusal({ dataStreamer, refusalMessage }) {
      dataStreamer?.streamResponses({
        type: "response.output_text.delta",
        delta: refusalMessage,
        content_index: 0,
        output_index: 0,
        item_id: "",
      } satisfies ResponseStreamOutputTextDelta);
      dataStreamer?.streamResponses({
        type: "response.output_text.done",
        text: refusalMessage,
        content_index: 0,
        output_index: 0,
        item_id: "",
      } satisfies ResponseStreamOutputTextDone);
    },
    onReferenceLinks({ dataStreamer, references }) {
      references.forEach((reference, index) => {
        dataStreamer?.streamResponses({
          type: "response.output_text.annotation.added",
          annotation: {
            type: "url_citation",
            url: reference.url,
            title: reference.title,
            start_index: 0,
            end_index: 0,
          },
          annotation_index: index,
          content_index: 0,
          output_index: 0,
          item_id: "",
        } satisfies ResponseStreamOutputTextAnnotationAdded);
      });
    },
    onTextDelta({ dataStreamer, delta }) {
      dataStreamer?.streamResponses({
        type: "response.output_text.delta",
        delta,
        content_index: 0,
        output_index: 0,
        item_id: "",
      } satisfies ResponseStreamOutputTextDelta);
    },
    onTextDone({ dataStreamer, text }) {
      dataStreamer?.streamResponses({
        type: "response.output_text.done",
        text,
        content_index: 0,
        output_index: 0,
        item_id: "",
      } satisfies ResponseStreamOutputTextDone);
    },
  };

/**
  Generate chatbot response using RAG and a search tool named {@link SEARCH_TOOL_NAME}.
 */
export function makeGenerateResponseWithSearchTool({
  languageModel,
  llmNotWorkingMessage,
  llmRefusalMessage,
  inputGuardrail,
  systemMessage,
  filterPreviousMessages,
  additionalTools,
  makeReferenceLinks = makeDefaultReferenceLinks,
  maxSteps = 2,
  searchTool,
  toolChoice,
  stream,
}: GenerateResponseWithSearchToolParams): GenerateResponse {
  return async function generateResponseWithSearchTool({
    conversation,
    latestMessageText,
    clientContext,
    customData,
    shouldStream,
    reqId,
    dataStreamer,
  }) {
    const streamingModeActive =
      shouldStream === true &&
      dataStreamer !== undefined &&
      stream !== undefined;

    const userMessage: UserMessage = {
      role: "user",
      content: latestMessageText,
    };
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

      const inputGuardrailPromise = inputGuardrail
        ? inputGuardrail({
            conversation,
            latestMessageText,
            clientContext,
            customData,
            shouldStream,
            reqId,
            dataStreamer,
          })
        : undefined;

      const references: References = [];
      let userMessageCustomData: Partial<MongoDbSearchToolArgs> = {};

      // Create an AbortController for the generation
      const generationController = new AbortController();
      let guardrailRejected = false;

      // Start guardrail check immediately and monitor it
      const guardrailMonitor = inputGuardrailPromise?.then((result) => {
        if (result?.rejected) {
          guardrailRejected = true;
          generationController.abort();
        }
        return result;
      });

      // Start generation immediately (in parallel with guardrail)
      const generationPromise = (async () => {
        try {
          const result = streamText({
            ...generationArgs,
            abortSignal: generationController.signal,
            onStepFinish: async ({ toolResults, toolCalls }) => {
              toolCalls?.forEach((toolCall) => {
                if (toolCall.toolName === SEARCH_TOOL_NAME) {
                  userMessageCustomData = {
                    ...userMessageCustomData,
                    ...toolCall.args,
                  };
                }
              });
              toolResults?.forEach((toolResult) => {
                if (
                  toolResult.type === "tool-result" &&
                  toolResult.toolName === SEARCH_TOOL_NAME
                ) {
                  const searchResults = toolResult.result.results;
                  if (searchResults && Array.isArray(searchResults)) {
                    references.push(...makeReferenceLinks(searchResults));
                  }
                }
              });
            },
          });

          let fullStreamText = "";
          // Process the stream
          for await (const chunk of result.fullStream) {
            // Check if we should abort due to guardrail rejection
            if (generationController.signal.aborted) {
              break;
            }

            switch (chunk.type) {
              case "text-delta":
                if (streamingModeActive) {
                  fullStreamText += chunk.textDelta;
                  stream.onTextDelta({
                    dataStreamer,
                    delta: chunk.textDelta,
                  });
                }
                break;
              case "finish":
                if (streamingModeActive) {
                  stream.onTextDone?.({
                    dataStreamer,
                    text: fullStreamText,
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

          // Stream references if we have any and weren't aborted
          if (references.length > 0 && !generationController.signal.aborted) {
            if (streamingModeActive) {
              stream.onReferenceLinks({
                dataStreamer,
                references,
              });
            }
          }

          return result;
        } catch (error: unknown) {
          // If aborted due to guardrail, return null
          if (generationController.signal.aborted && guardrailRejected) {
            return null;
          }
          throw new Error(typeof error === "string" ? error : String(error));
        }
      })();

      // Wait for both to complete
      const [guardrailResult, result] = await Promise.all([
        guardrailMonitor ?? Promise.resolve(undefined),
        generationPromise,
      ]);

      // If the guardrail rejected the query,
      // return the LLM refusal message
      if (guardrailResult?.rejected) {
        userMessage.rejectQuery = guardrailResult.rejected;
        userMessage.metadata = {
          ...userMessage.metadata,
        };
        userMessage.customData = {
          ...userMessage.customData,
          ...userMessageCustomData,
          ...guardrailResult,
        };
        if (streamingModeActive) {
          stream.onLlmRefusal({
            dataStreamer,
            refusalMessage: llmRefusalMessage,
          });
        }
        return handleReturnGeneration({
          userMessage,
          guardrailResult,
          messages: [
            {
              role: "assistant",
              content: llmRefusalMessage,
            },
          ],
          userMessageCustomData,
        });
      }

      // Otherwise, return the generated response
      assert(result, "result is required");
      const llmResponse = await result?.response;
      const messages = llmResponse?.messages || [];

      // Add metadata to user message
      userMessage.metadata = {
        ...userMessage.metadata,
        ...userMessageCustomData,
      };

      // If we received messages from the LLM, use them, otherwise handle error case
      if (messages && messages.length > 0) {
        return handleReturnGeneration({
          userMessage,
          guardrailResult,
          messages,
          references,
          userMessageCustomData,
        });
      } else {
        // Fallback in case no messages were returned
        return handleReturnGeneration({
          userMessage,
          guardrailResult,
          messages: [
            {
              role: "assistant",
              content: llmNotWorkingMessage,
            },
          ],
          references,
          userMessageCustomData,
        });
      }
    } catch (error: unknown) {
      if (streamingModeActive) {
        stream.onLlmNotWorking({
          dataStreamer,
          notWorkingMessage: llmNotWorkingMessage,
        });
      }

      // Create error message with references attached
      const errorMessage: AssistantMessage = {
        role: "assistant",
        content: llmNotWorkingMessage,
      };

      return {
        messages: [userMessage, errorMessage],
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
  userMessageCustomData,
}: {
  userMessage: UserMessage;
  guardrailResult: InputGuardrailResult | undefined;
  messages: ResponseMessage[];
  references?: References;
  userMessageCustomData: Record<string, unknown> | undefined;
}): GenerateResponseReturnValue {
  userMessage.rejectQuery = guardrailResult?.rejected;
  userMessage.customData = {
    ...userMessage.customData,
    ...userMessageCustomData,
    ...guardrailResult,
  };

  const formattedMessages = formatMessageForReturnGeneration(
    messages,
    references ?? []
  );

  return {
    messages: [userMessage, ...formattedMessages],
  } satisfies GenerateResponseReturnValue;
}

function formatMessageForReturnGeneration(
  messages: ResponseMessage[],
  references: References
): [...SomeMessage[], AssistantMessage] {
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
              const result = (c.result as Array<ToolResultPart | TextPart>)[0];
              if (result.type === "text") {
                baseMessage.content = result.text;
              }
              if (result.type === "tool-result") {
                baseMessage.content = JSON.stringify(result.result);
              }
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

  // Make sure we have at least one assistant message
  if (messagesOut.length === 0 || messagesOut.at(-1)?.role !== "assistant") {
    messagesOut.push({
      role: "assistant",
      content: "",
    } as AssistantMessage);
  }
  const latestMessage = messagesOut.at(-1) as AssistantMessage;
  latestMessage.references = references;
  return messagesOut as [...SomeMessage[], AssistantMessage];
}

function formatMessageForAiSdk(message: SomeMessage): CoreMessage {
  if (message.role === "assistant") {
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
        content: message.content,
      } satisfies CoreAssistantMessage;
    }
  } else if (message.role === "tool") {
    // Convert tool messages to the format expected by the AI SDK
    return {
      role: "tool",
      content: [
        {
          toolName: message.name,
          type: "tool-result",
          result: message.content,
          toolCallId: "",
        } satisfies ToolResultPart,
      ],
    } satisfies CoreToolMessage;
  } else {
    // User and system messages can pass through
    return message satisfies CoreMessage;
  }
}
