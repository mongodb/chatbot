import {
  References,
  SomeMessage,
  UserMessage,
  AssistantMessage,
  ToolMessage,
  type ResponseStreamOutputTextDone,
  type ResponseStreamOutputTextDelta,
  type ResponseStreamOutputTextAnnotationAdded,
  type ResponseStreamFunctionCallArgumentsDelta,
  type ResponseStreamFunctionCallArgumentsDone,
  ResponseStreamOutputItemAdded,
  ResponseStreamOutputItemDone,
  Promotion,
} from "mongodb-rag-core";
import {
  AssistantModelMessage,
  ModelMessage,
  ToolCallPart,
  ToolChoice,
  ToolSet,
  ToolModelMessage,
  Tool,
  tool,
  streamText,
  hasToolCall,
  LanguageModel,
  stepCountIs,
  jsonSchema,
  JSONSchema7,
} from "mongodb-rag-core/aiSdk";
import { strict as assert } from "assert";
import {
  InputGuardrail,
  FilterPreviousMessages,
  GenerateResponse,
  GenerateResponseReturnValue,
  InputGuardrailResult,
  type StreamFunction,
  GenerateResponseParams,
} from "mongodb-chatbot-server";
import { formatUserMessageForGeneration } from "../processors/formatUserMessageForGeneration";
import { SEARCH_TOOL_NAME, SearchTool } from "../tools/search";
import { FETCH_PAGE_TOOL_NAME, FetchPageTool } from "../tools/fetchPage";
import { MakeSystemPrompt } from "../systemPrompt";
import { logRequest } from "../utils";
import { wrapLanguageModel, LanguageModelV2 } from 'mongodb-rag-core/aiSdk';
import { classifySkill } from "../middleware/classifySkill";

/**
  Tools that are internal to the MongoDB Responses API.
  The model may choose to call them under the hood,
  but their usage should not be exposed to the client through streaming.
 */
const INTERNAL_TOOLS = [SEARCH_TOOL_NAME, FETCH_PAGE_TOOL_NAME];

export interface GenerateResponseWithToolsParams {
  languageModel: LanguageModelV2;
  llmNotWorkingMessage: string;
  llmRefusalMessage: string;
  inputGuardrail?: InputGuardrail;
  makeSystemPrompt: MakeSystemPrompt;
  filterPreviousMessages?: FilterPreviousMessages;
  /**
    Required tool for performing content search and gathering {@link References}
   */
  additionalTools?: ToolSet;
  maxSteps: number;
  internalTools: {
    [SEARCH_TOOL_NAME]: SearchTool;
    [FETCH_PAGE_TOOL_NAME]: FetchPageTool;
    [name: string]: Tool;
  };
  stream?: {
    onLlmNotWorking: StreamFunction<{ notWorkingMessage: string }>;
    onLlmRefusal: StreamFunction<{ refusalMessage: string }>;
    onReferenceLinks: StreamFunction<{
      references: References;
      textPartId: string;
    }>;
    onPromotionLink: StreamFunction<{
      promotion: Promotion;
      textPartId: string;
    }>;
    onTextStart?: StreamFunction<{
      text: string;
      textPartId: string;
      chunkId: string;
    }>;
    onTextDelta: StreamFunction<{
      delta: string;
      textPartId: string;
      chunkId: string;
    }>;
    onTextDone?: StreamFunction<{
      text: string;
      references: References;
      textPartId: string;
      chunkId: string;
    }>;
    onFunctionCallStart?: StreamFunction<{
      toolCallId: string;
      toolName: string;
      chunkId: string;
    }>;
    onFunctionCallDelta?: StreamFunction<{
      toolCallId: string;
      delta: string;
      chunkId: string;
    }>;
    onFunctionCallDone?: StreamFunction<{
      toolCallId: string;
      toolName: string;
      input: unknown;
      chunkId: string;
    }>;
  };
}

export const addMessageToConversationStream: GenerateResponseWithToolsParams["stream"] =
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
    onPromotionLink({ dataStreamer, promotion }) {
      dataStreamer?.streamData({
        type: "promotion",
        data: promotion,
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

export const responsesApiStream: GenerateResponseWithToolsParams["stream"] = {
  onLlmNotWorking({ dataStreamer, notWorkingMessage }) {
    const itemId = Date.now().toString();

    dataStreamer?.streamResponses({
      type: "response.output_item.added",
      output_index: 0,
      item: {
        type: "message",
        id: itemId,
        content: [],
        role: "assistant",
        status: "in_progress",
      },
    } satisfies ResponseStreamOutputItemAdded);
    dataStreamer?.streamResponses({
      type: "response.output_text.delta",
      delta: notWorkingMessage,
      content_index: 0,
      output_index: 0,
      item_id: itemId,
      logprobs: [],
    } satisfies ResponseStreamOutputTextDelta);
    dataStreamer?.streamResponses({
      type: "response.output_text.done",
      text: notWorkingMessage,
      content_index: 0,
      output_index: 0,
      item_id: itemId,
      logprobs: [],
    } satisfies ResponseStreamOutputTextDone);
    dataStreamer?.streamResponses({
      type: "response.output_item.done",
      output_index: 0,
      item: {
        type: "message",
        id: itemId,
        content: [
          {
            type: "output_text",
            text: notWorkingMessage,
            annotations: [],
          },
        ],
        role: "assistant",
        status: "completed",
      },
    } satisfies ResponseStreamOutputItemDone);
  },
  onLlmRefusal({ dataStreamer, refusalMessage }) {
    const itemId = Date.now().toString();

    dataStreamer?.streamResponses({
      type: "response.output_item.added",
      output_index: 0,
      item: {
        type: "message",
        id: itemId,
        content: [],
        role: "assistant",
        status: "in_progress",
      },
    } satisfies ResponseStreamOutputItemAdded);
    dataStreamer?.streamResponses({
      type: "response.output_text.delta",
      delta: refusalMessage,
      content_index: 0,
      output_index: 0,
      item_id: itemId,
      logprobs: [],
    } satisfies ResponseStreamOutputTextDelta);
    dataStreamer?.streamResponses({
      type: "response.output_text.done",
      text: refusalMessage,
      content_index: 0,
      output_index: 0,
      item_id: itemId,
      logprobs: [],
    } satisfies ResponseStreamOutputTextDone);
    dataStreamer?.streamResponses({
      type: "response.output_item.done",
      output_index: 0,
      item: {
        type: "message",
        id: itemId,
        content: [
          {
            type: "output_text",
            text: refusalMessage,
            annotations: [],
          },
        ],
        role: "assistant",
        status: "completed",
      },
    } satisfies ResponseStreamOutputItemDone);
  },
  onReferenceLinks({ dataStreamer, references, textPartId }) {
    convertReferencesToAnnotations(references).forEach((annotation, index) => {
      dataStreamer?.streamResponses({
        type: "response.output_text.annotation.added",
        annotation,
        annotation_index: index,
        content_index: 0,
        output_index: 0,
        item_id: textPartId,
      } satisfies ResponseStreamOutputTextAnnotationAdded);
    });
  },
  onPromotionLink({ dataStreamer, promotion, textPartId }) {
    dataStreamer?.streamResponses({
      type: "response.output_text.annotation.added",
      annotation: convertPromotionToFileAnnotation(promotion),
      annotation_index: 0,
      content_index: 0,
      output_index: 0,
      item_id: textPartId,
    });
  },
  onTextStart({ dataStreamer, textPartId }) {
    dataStreamer?.streamResponses({
      type: "response.output_item.added",
      output_index: 0,
      item: {
        type: "message",
        id: textPartId,
        content: [],
        role: "assistant",
        status: "in_progress",
      },
    } satisfies ResponseStreamOutputItemAdded);
  },
  onTextDelta({ dataStreamer, delta, textPartId }) {
    dataStreamer?.streamResponses({
      type: "response.output_text.delta",
      delta,
      content_index: 0,
      output_index: 0,
      item_id: textPartId,
      logprobs: [],
    } satisfies ResponseStreamOutputTextDelta);
  },
  onTextDone({ dataStreamer, text, references, textPartId, chunkId }) {
    dataStreamer?.streamResponses({
      type: "response.output_text.done",
      text,
      content_index: 0,
      output_index: 0,
      item_id: textPartId,
      logprobs: [],
    } satisfies ResponseStreamOutputTextDone);
    dataStreamer?.streamResponses({
      type: "response.output_item.done",
      output_index: 0,
      item: {
        type: "message",
        id: chunkId,
        content: [
          {
            type: "output_text",
            text,
            annotations: convertReferencesToAnnotations(references),
          },
        ],
        role: "assistant",
        status: "completed",
      },
    } satisfies ResponseStreamOutputItemDone);
  },
  onFunctionCallStart({ dataStreamer, toolCallId, toolName, chunkId }) {
    dataStreamer?.streamResponses({
      type: "response.output_item.added",
      output_index: 0,
      item: {
        arguments: "",
        call_id: toolCallId,
        name: toolName,
        id: chunkId,
        type: "function_call",
        status: "in_progress",
      },
    } satisfies ResponseStreamOutputItemAdded);
  },
  onFunctionCallDelta({ dataStreamer, toolCallId, delta }) {
    dataStreamer?.streamResponses({
      type: "response.function_call_arguments.delta",
      delta,
      output_index: 0,
      item_id: toolCallId,
    } satisfies ResponseStreamFunctionCallArgumentsDelta);
  },
  onFunctionCallDone({ dataStreamer, toolCallId, toolName, input, chunkId }) {
    const args = JSON.stringify(input);

    dataStreamer?.streamResponses({
      type: "response.function_call_arguments.done",
      arguments: args,
      output_index: 0,
      item_id: toolCallId,
    } satisfies ResponseStreamFunctionCallArgumentsDone);
    dataStreamer?.streamResponses({
      type: "response.output_item.done",
      output_index: 0,
      item: {
        arguments: args,
        call_id: toolCallId,
        name: toolName,
        id: chunkId,
        type: "function_call",
        status: "completed",
      },
    } satisfies ResponseStreamOutputItemDone);
  },
};

/**
  Generate chatbot response using RAG and a search tool named {@link SEARCH_TOOL_NAME}.
 */
export function makeGenerateResponseWithTools({
  languageModel,
  llmNotWorkingMessage,
  llmRefusalMessage,
  inputGuardrail,
  makeSystemPrompt,
  filterPreviousMessages,
  internalTools,
  additionalTools,
  maxSteps,
  stream,
}: GenerateResponseWithToolsParams): GenerateResponse {
  return async function generateResponseWithTools({
    conversation,
    latestMessageText,
    clientContext,
    customData,
    shouldStream,
    reqId,
    dataStreamer,
    customSystemPrompt,
    toolDefinitions,
    toolChoice,
  }) {
    const streamingModeActive =
      shouldStream === true &&
      dataStreamer !== undefined &&
      stream !== undefined;

    const userMessage: UserMessage = {
      role: "user",
      content: formatUserMessageForGeneration({
        userMessageText: latestMessageText,
        reqId,
        customData,
      }),
    };
    try {
      // Get preceding messages to include in the LLM prompt
      const filteredPreviousMessages = filterPreviousMessages
        ? (await filterPreviousMessages(conversation)).map(
            formatMessageForAiSdk
          )
        : [];

      const defaultToolSet = {
        ...internalTools,
        ...(additionalTools ?? {}),
      } satisfies ToolSet;

      const generationArgs = {
        model: languageModel,
        messages: [
          makeSystemPrompt(customSystemPrompt),
          ...filteredPreviousMessages,
          userMessage,
        ] satisfies ModelMessage[],
        tools: defaultToolSet,
        toolChoice,
        maxSteps,
      };

      // Start the async promises now, before generation
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
      const skillPromotionPromise = classifySkill(latestMessageText);

      const references: References = [];

      // Create an AbortController for the generation
      const generationController = new AbortController();
      let guardrailRejected = false;

      // Start guardrail check immediately and monitor it
      const guardrailMonitor =
        inputGuardrailPromise?.then((result) => {
          if (result?.rejected) {
            guardrailRejected = true;
            generationController.abort();
          }
          return result;
        }) ?? Promise.resolve(undefined);

      // Start generation immediately (in parallel with guardrail)
      const generationPromise = (async () => {
        try {
          // Create the complete tool set with proper typing
          const allTools = {
            ...defaultToolSet,
            ...formatToolDefinitionsForAiSdk(toolDefinitions),
          } as const;

          const result = streamText({
            ...generationArgs,
            tools: allTools,
            toolChoice: formatToolChoiceForAiSdk(toolChoice, allTools),
            abortSignal: generationController.signal,
            // Stops generation when one of the criteria is met:
            // - max steps are reached
            // - custom tool defintion is called
            stopWhen: [
              stepCountIs(maxSteps),
              ...(toolDefinitions?.map((toolDef) =>
                hasToolCall(toolDef.name)
              ) ?? []),
            ],

            // Appends references when a reference-returning tool is called
            onStepFinish: async ({ toolResults }) => {
              for (const toolResult of toolResults) {
                if (toolResult.dynamic) {
                  continue;
                }
                if (
                  toolResult.type === "tool-result" &&
                  toolResult.output.references
                ) {
                  references.push(...toolResult.output.references);
                }
              }
            },
          });

          // Wait for guardrail before streaming content (addresses race condition)
          const guardrailResult = await guardrailMonitor;
          if (guardrailResult?.rejected) {
            throw new Error(
              "Guardrail rejected. Aborting generation (you shouldn't see this)"
            );
          }

          let fullStreamText = "";
          let textPartId = ""; // Shared between text-start and text-end
          let toolCallId = "";
          let internalToolActivated = false;
          // Process the stream
          for await (const chunk of result.fullStream) {
            // Check if we should abort due to guardrail rejection
            if (generationController.signal.aborted) {
              break;
            }

            switch (chunk.type) {
              case "text-start":
                if (streamingModeActive) {
                  textPartId = chunk.id;
                  stream.onTextStart?.({
                    dataStreamer,
                    text: "",
                    textPartId,
                    chunkId: chunk.id,
                  });
                }
                break;
              case "text-delta":
                if (streamingModeActive) {
                  fullStreamText += chunk.text;
                  stream.onTextDelta({
                    dataStreamer,
                    delta: chunk.text,
                    textPartId,
                    chunkId: chunk.id,
                  });
                }
                break;
              case "text-end":
                if (streamingModeActive) {
                  stream.onTextDone?.({
                    dataStreamer,
                    text: fullStreamText,
                    references,
                    textPartId,
                    chunkId: chunk.id,
                  });
                }
                break;

              case "tool-input-start":
                if (streamingModeActive) {
                  const { id, toolName } = chunk;
                  toolCallId = id;
                  internalToolActivated = INTERNAL_TOOLS.includes(toolName);

                  if (internalToolActivated) break;

                  stream.onFunctionCallStart?.({
                    dataStreamer,
                    toolCallId,
                    toolName,
                    chunkId: chunk.id,
                  });
                }
                break;
              case "tool-input-delta":
                if (streamingModeActive) {
                  const { id, delta } = chunk;
                  stream.onFunctionCallDelta?.({
                    dataStreamer,
                    delta,
                    toolCallId,
                    chunkId: id,
                  });
                }
                break;
              case "tool-input-end":
                break;
              case "tool-call":
                if (streamingModeActive && !internalToolActivated) {
                  const { input, toolCallId, toolName } = chunk;
                  stream.onFunctionCallDone?.({
                    dataStreamer,
                    toolCallId,
                    toolName,
                    input,
                    chunkId: "",
                  });
                } else {
                  internalToolActivated = false;
                }
                break;
              case "finish":
                break;
              case "tool-result":
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

          // Stream the chosen skill, if any
          const skillPromotion = await skillPromotionPromise;
          if (skillPromotion && !generationController.signal.aborted) {
            if (streamingModeActive) {
              stream.onPromotionLink({
                dataStreamer,
                promotion: skillPromotion,
                textPartId,
              });
            }
          }

          // Stream references if we have any and weren't aborted
          if (references.length > 0 && !generationController.signal.aborted) {
            if (streamingModeActive) {
              stream.onReferenceLinks({
                dataStreamer,
                references,
                textPartId,
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
          reqId,
        });
      }

      // Otherwise, return the generated response
      assert(result, "result is required");
      const llmResponse = await result?.response;
      const messages = llmResponse?.messages || [];

      // If we received messages from the LLM, use them, otherwise handle error case
      if (messages && messages.length > 0) {
        return handleReturnGeneration({
          userMessage,
          guardrailResult,
          messages,
          references,
          reqId,
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
          reqId,
          references,
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

type ResponseMessage = AssistantModelMessage | ToolModelMessage;

/**
  Generate the final messages to send to the user based on guardrail result and text generation result
 */
function handleReturnGeneration({
  userMessage,
  guardrailResult,
  messages,
  references,
  reqId,
}: {
  userMessage: UserMessage;
  guardrailResult: InputGuardrailResult | undefined;
  messages: ResponseMessage[];
  references?: References;
  reqId: string;
}): GenerateResponseReturnValue {
  userMessage.rejectQuery = guardrailResult?.rejected;
  userMessage.metadata = userMessage.metadata ?? {};
  userMessage.customData = {
    ...userMessage.customData,
    ...guardrailResult,
  };

  const formattedMessages = formatMessageForReturnGeneration(
    messages,
    reqId,
    references ?? []
  );

  return {
    messages: [userMessage, ...formattedMessages],
  } satisfies GenerateResponseReturnValue;
}

function makeAssitantMessage(
  reqId: string,
  m: AssistantModelMessage
): AssistantMessage[] {
  const baseMessage: Partial<AssistantMessage> & { role: "assistant" } = {
    role: "assistant",
  };
  if (typeof m.content === "string") {
    return [
      {
        ...baseMessage,
        content: m.content ?? "",
      },
    ];
  }
  const result: AssistantMessage[] = [];
  m.content.forEach((c) => {
    if (c.type === "text") {
      result.push({
        ...baseMessage,
        content: c.text,
      } satisfies AssistantMessage);
    } else if (c.type === "tool-call") {
      result.push({
        ...baseMessage,
        content: "",
        toolCall: {
          type: "function",
          id: c.toolCallId,
          function: {
            name: c.toolName,
            arguments: JSON.stringify(c.input),
          },
        },
      } satisfies AssistantMessage);
    } else {
      logRequest({
        reqId,
        message: `Unknown content type in assistant message: ${c.type}`,
        type: "error",
      });
    }
  });
  return result;
}

function makeToolMessage(m: ToolModelMessage): ToolMessage[] {
  return m.content.map((c) => {
    const newToolMessage: ToolMessage = {
      role: "tool",
      content: "",
      name: c.toolName,
    };
    if (c.output.type === "content" && c.output.value[0].type === "text") {
      // This is one of our tools (fetch_page or search), with result content.
      newToolMessage.content = c.output.value[0].text;
    } else if (
      c.output &&
      typeof c.output === "object" &&
      "value" in c.output
    ) {
      newToolMessage.content =
        typeof c.output.value === "string"
          ? c.output.value
          : JSON.stringify(c.output.value);
    } else {
      newToolMessage.content =
        typeof c.output === "string" ? c.output : JSON.stringify(c.output);
    }
    return newToolMessage;
  });
}

function formatMessageForReturnGeneration(
  messages: ResponseMessage[],
  reqId: string,
  references: References
): [...SomeMessage[], AssistantMessage] {
  const messagesOut: Array<SomeMessage | AssistantMessage> = [];
  messages.forEach((m) => {
    if (m.role === "assistant") {
      messagesOut.push(...makeAssitantMessage(reqId, m));
    } else if (m.role === "tool") {
      messagesOut.push(...makeToolMessage(m));
    }
  });

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

function formatMessageForAiSdk(message: SomeMessage): ModelMessage {
  if (message.role === "assistant") {
    // Convert assistant messages with object content to proper format
    if (message.toolCall && message.toolCall.type === "function") {
      // This is a tool call message
      return {
        role: "assistant",
        content: [
          {
            type: "tool-call",
            toolCallId: message.toolCall.id,
            toolName: message.toolCall.function.name,
            input: message.toolCall.function.arguments,
          } satisfies ToolCallPart,
        ],
      } satisfies AssistantModelMessage;
    } else {
      // Fallback for other object content
      return {
        role: "assistant",
        content: message.content,
      } satisfies AssistantModelMessage;
    }
  } else if (message.role === "tool") {
    // Convert tool messages to the format expected by the AI SDK
    return {
      role: "tool",
      content: [
        {
          type: "tool-result",
          toolCallId: "",
          toolName: message.name,
          output: {
            type: "json",
            value: message.content,
          },
        },
      ],
    } satisfies ToolModelMessage;
  } else {
    // User and system messages can pass through
    return message satisfies ModelMessage;
  }
}

function formatToolDefinitionsForAiSdk(
  toolDefinitions: GenerateResponseParams["toolDefinitions"]
): Record<string, Tool> {
  return (
    toolDefinitions?.reduce((acc, toolDef) => {
      acc[toolDef.name] = tool({
        name: toolDef.name,
        description: toolDef.description,
        inputSchema: jsonSchema(toolDef.parameters as JSONSchema7),
      });
      return acc;
    }, {} as Record<string, Tool>) ?? {}
  );
}

function formatToolChoiceForAiSdk<T extends Record<string, Tool>>(
  toolChoice: GenerateResponseParams["toolChoice"],
  tools: T
): ToolChoice<T> | undefined {
  if (!toolChoice) {
    return undefined;
  }
  if (toolChoice === "auto") {
    return "auto";
  }
  // Validate that the tool exists in the tools object
  if (toolChoice.name in tools) {
    return {
      toolName: toolChoice.name as Extract<keyof T, string>,
      type: "tool",
    };
  }

  // Fallback: if tool doesn't exist, return undefined (no tool choice)
  return undefined;
}

function convertReferencesToAnnotations(
  references: References
): ResponseStreamOutputTextAnnotationAdded["annotation"][] {
  return references.map((reference) => ({
    type: "url_citation",
    url: reference.url,
    title: reference.title,
    start_index: 0,
    end_index: 0,
  }));
}

function convertPromotionToFileAnnotation(
  promotion: Promotion
): ResponseStreamOutputTextAnnotationAdded["annotation"] {
  const file_id = promotion.topic ? `${promotion.topic}/${promotion.title}` : promotion.title ;
  const query = encodeURI(`type=${promotion.type}&text=${promotion.description}`);
  return {
    type: "file_citation",
    file_id,
    filename: `promotion://${file_id}?${query}`,
    index: 0,
  };
}
