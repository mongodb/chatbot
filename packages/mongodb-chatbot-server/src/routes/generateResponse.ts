import {
  References,
  SomeMessage,
  DataStreamer,
  Conversation,
  escapeNewlines,
  OpenAiChatMessage,
  AssistantMessage,
  UserMessage,
  ConversationCustomData,
  ChatLlm,
  SystemMessage,
  FindContentFunc,
} from "mongodb-rag-core";
import { Request as ExpressRequest } from "express";
import { logRequest } from "../utils";
import { strict as assert } from "assert";
import { GenerateUserPromptFunc } from "../processors/GenerateUserPromptFunc";
import { FilterPreviousMessages } from "../processors/FilterPreviousMessages";
import {
  CoreMessage,
  generateText,
  LanguageModel,
  streamText,
  tool,
  ToolChoice,
} from "mongodb-rag-core/aiSdk";
import { z } from "zod";
export type ClientContext = Record<string, unknown>;

// TODO: refactor to remove everything that's constant across requests.
// only keep the request-specific data.
export interface GenerateResponseParams {
  shouldStream: boolean;
  latestMessageText: string;
  clientContext?: ClientContext;
  customData?: ConversationCustomData;
  dataStreamer?: DataStreamer;
  reqId: string;
  conversation: Conversation;
  request?: ExpressRequest;
  // TODO: remove. this is just going away
  generateUserPrompt?: GenerateUserPromptFunc;
  llm: ChatLlm; // TODO: remove. going to constructor
  // TODO: remove
  filterPreviousMessages?: FilterPreviousMessages;
  // TODO: remove. going to constructor
  llmNotWorkingMessage: string;
  // TODO: remove. going to constructor
  noRelevantContentMessage: string;
}

interface GenerateResponseReturnValue {
  messages: SomeMessage[];
}

export type GenerateResponse = (
  params: GenerateResponseParams
) => Promise<GenerateResponseReturnValue>;

type InputGuardrail<
  Metadata extends Record<string, unknown> | undefined = Record<string, unknown>
> = (generateResponseParams: Omit<GenerateResponseParams, "llm">) => Promise<{
  rejected: boolean;
  reason?: string;
  message: string;
  metadata: Metadata;
}>;

function withAbortControllerGuardrail<T, G>(
  fn: (abortController: AbortController) => Promise<T>,
  guardrailPromise?: Promise<G>
): Promise<{ result: T | null; guardrailResult: Awaited<G> | undefined }> {
  const abortController = new AbortController();
  return (async () => {
    try {
      // Run both the main function and guardrail function in parallel
      const [result, guardrailResult] = await Promise.all([
        fn(abortController).catch((error) => {
          // If the main function was aborted by the guardrail, return null
          if (error.name === "AbortError") {
            return null as T | null;
          }
          throw error;
        }),
        guardrailPromise,
      ]);

      return { result, guardrailResult };
    } catch (error) {
      // If an unexpected error occurs, abort any ongoing operations
      if (!abortController.signal.aborted) {
        abortController.abort();
      }
      throw error;
    }
  })();
}

// TODO: rename this to be clearer on what this is.
// this is basically v2 of chatbot server which makes the thing an agent.
export const makeGenerateResponseAiSdk: (
  languageModel: LanguageModel,
  llmNotWorkingMessage: string,
  noRelevantContentMessage: string,
  findContent: FindContentFunc,
  inputGuardrail?: InputGuardrail,
  systemMessage?: SystemMessage,
  filterPreviousMessages?: FilterPreviousMessages
) => GenerateResponse = (
  languageModel,
  llmNotWorkingMessage,
  noRelevantContentMessage,
  findContent,
  inputGuardrail,
  systemMessage,
  filterPreviousMessages
) =>
  // TODO: refactor generate content func to just take these things in
  // should only be these b/c these are the only request-specific params
  async function ({
    conversation,
    latestMessageText,
    clientContext,
    customData,
    shouldStream,
    reqId,
    dataStreamer,
    request,
  }) {
    try {
      const tools = {
        findContent: tool({
          parameters: z.object({
            query: z.string(),
          }),
          execute: async (parameters) => {
            const { content } = await findContent({
              query: parameters.query,
            });
            return { content };
          },
        }),
      };

      // Get preceding messages to include in the LLM prompt
      const filteredPreviousMessages = filterPreviousMessages
        ? (await filterPreviousMessages(conversation)).map(
            convertConversationMessageToLlmMessage
          )
        : [];

      const generationArgs = {
        model: languageModel,
        messages: [
          ...(systemMessage ? [systemMessage] : []),
          ...filteredPreviousMessages,
          {
            role: "user",
            content: latestMessageText,
          },
        ] as CoreMessage[],
        tools,
        toolChoice: {
          type: "tool" as const,
          toolName: "findContent",
        } satisfies ToolChoice<typeof tools>,
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
            llmNotWorkingMessage,
            noRelevantContentMessage,
          })
        : undefined;

      if (shouldStream) {
        // TODO: handle metadata..how?
        // note: not sure if necessary.
        // if (metadata) {
        //   dataStreamer.streamData({ type: "metadata", data: metadata });
        // }
        const { result: textGenerationResult, guardrailResult } =
          await withAbortControllerGuardrail(async (controller) => {
            // TODO: refactor this an indepentdent function
            const toolReferences: References = [];
            const { fullStream, text } = streamText({
              ...generationArgs,
              abortSignal: controller.signal,
            });
            for await (const chunk of fullStream) {
              switch (chunk.type) {
                case "text-delta":
                  dataStreamer?.streamData({
                    data: chunk.textDelta,
                    type: "delta",
                  });
                  break;
                case "tool-result":
                  // TODO: update to handle the retrieval tool call
                  if (chunk.toolName === "findContent") {
                    const references = chunk.result.content.map((c) => ({
                      url: c.url,
                      title: c.metadata?.pageTitle ?? "",
                      metadata: c.metadata,
                    }));
                    toolReferences.push(...references);
                    dataStreamer?.streamData({
                      data: references,
                      type: "references",
                    });
                  }
                  break;
                default:
                  break;
              }
            }
            return {
              text: await text,
              references: toolReferences,
            };
          }, inputGuardrailPromise);
        // TODO: thinkg about this..
        // the remainder of this if statement should be the same for both stream/non-stream
        // and therefore modularized into a single helper function.
        // create that helper function.
        const precedingMessages: SomeMessage[] = [];

        if (guardrailResult?.rejected) {
          return {
            messages: [
              ...precedingMessages,
              {
                role: "assistant",
                content: guardrailResult.message,
                metadata: guardrailResult.metadata,
                customData,
              } satisfies SomeMessage,
            ],
          };
        }

        return {
          messages: [
            ...precedingMessages,
            {
              role: "assistant",
              content: textGenerationResult?.text || llmNotWorkingMessage,
            } satisfies SomeMessage,
          ],
        };
      }
      // ---
      // NO STREAMING
      // ---
      else {
        // Use the withAbortControllerGuardrail pattern for non-streaming as well
        const { result: textGenerationResult, guardrailResult } =
          await withAbortControllerGuardrail(async (controller) => {
            // Start the text generation with the abort controller
            return generateText({
              ...generationArgs,
              abortSignal: controller.signal,
            });
          }, inputGuardrailPromise);

        // TODO: here on down in the remainder of the else statement is what shoudl be modularized into the above mentioned function
        if (guardrailResult?.rejected) {
          return {
            messages: [
              {
                role: "assistant",
                content: guardrailResult.message,
                metadata: guardrailResult.metadata,
                customData,
              } satisfies SomeMessage,
            ],
          };
        }

        // If we get here, the guardrail check passed and the text generation succeeded
        return {
          messages: [
            {
              role: "assistant",
              content: textGenerationResult?.text || llmNotWorkingMessage,
            } satisfies SomeMessage,
          ],
        };
      }
    } catch (error: unknown) {
      // Handle other errors
      console.error("Error in generateResponseAiSdk:", error);
      return {
        messages: [
          // TODO: handle preceding messages
          {
            role: "assistant",
            content: llmNotWorkingMessage,
          },
        ],
      };
    }
  };

// TODO:
// this is the above mentioned function that takes preceding messages, the guardrail result, and the text generation result
// should return the final messages to send to the user
function handleReturnGeneration() {
  // TODO:
  return;
}

/**
  Generate a response with/without streaming. Supports tool calling
  and standard response generation.
  Response includes the user message with any data mutations
  and the assistant response message, plus any intermediate tool calls.
 */
export async function generateResponse({
  shouldStream,
  llm,
  latestMessageText,
  clientContext,
  customData,
  generateUserPrompt,
  filterPreviousMessages,
  dataStreamer,
  reqId,
  llmNotWorkingMessage,
  noRelevantContentMessage,
  conversation,
  request,
}: GenerateResponseParams): Promise<GenerateResponseReturnValue> {
  const { messages, references, staticResponse, rejectQuery } =
    await (generateUserPrompt
      ? generateUserPrompt({
          userMessageText: latestMessageText,
          clientContext,
          conversation,
          reqId,
          customData,
        })
      : {
          userMessage: {
            role: "user",
            content: latestMessageText,
            customData,
          } satisfies UserMessage,
        });
  console.log("all messages in", messages);
  const userMessage = messages?.findLast((m) => m.role === "user");
  if (!userMessage) {
    throw new Error("User message not found");
  }
  // Add request custom data to user message.
  const userMessageWithCustomData = customData
    ? {
        ...userMessage,
        // Override request custom data fields with user message custom data fields.
        customData: { ...customData, ...(userMessage.customData ?? {}) },
      }
    : userMessage;
  const newMessages: SomeMessage[] = [
    userMessageWithCustomData,
    ...(messages?.slice(1) ?? []),
  ];

  // Metadata for streaming
  let streamingResponseMetadata: Record<string, unknown> | undefined;
  // Send static response if query rejected or static response provided
  if (rejectQuery) {
    const rejectionMessage = {
      role: "assistant",
      content: noRelevantContentMessage,
      references: references ?? [],
    } satisfies AssistantMessage;
    newMessages.push(rejectionMessage);
  } else if (staticResponse) {
    newMessages.push(staticResponse);
    // Need to specify response metadata for streaming
    streamingResponseMetadata = staticResponse.metadata;
  }

  // Prepare conversation messages for LLM
  const previousConversationMessagesForLlm = (
    filterPreviousMessages
      ? await filterPreviousMessages(conversation)
      : conversation.messages
  ).map(convertConversationMessageToLlmMessage);
  const newMessagesForLlm = newMessages.map((m) => {
    // Use transformed content if it exists for user message
    // (e.g. from a custom user prompt, query preprocessor, etc),
    // otherwise use original content.
    if (m.role === "user") {
      return {
        content: m.contentForLlm ?? m.content,
        role: "user",
      } satisfies OpenAiChatMessage;
    }
    return convertConversationMessageToLlmMessage(m);
  });
  const llmConversation = [
    ...previousConversationMessagesForLlm,
    ...newMessagesForLlm,
  ];
  console.log("llmConversation before...", llmConversation);

  const shouldGenerateMessage = !rejectQuery && !staticResponse;

  if (shouldStream) {
    assert(dataStreamer, "Data streamer required for streaming");
    const { messages } = await streamGenerateResponseMessage({
      dataStreamer,
      reqId,
      llm,
      llmConversation,
      noRelevantContentMessage,
      llmNotWorkingMessage,
      request,
      shouldGenerateMessage,
      conversation,
      references,
      metadata: streamingResponseMetadata,
    });
    newMessages.push(...messages);
  } else {
    const { messages } = await awaitGenerateResponseMessage({
      reqId,
      llm,
      llmConversation,
      llmNotWorkingMessage,
      noRelevantContentMessage,
      request,
      shouldGenerateMessage,
      conversation,
      references,
    });
    newMessages.push(...messages);
  }
  return { messages: newMessages };
}

type BaseGenerateResponseMessageParams = Omit<
  GenerateResponseParams,
  "latestMessageText" | "customData" | "filterPreviousMessages" | "shouldStream"
> & {
  references?: References;
  shouldGenerateMessage?: boolean;
  llmConversation: OpenAiChatMessage[];
};

export type AwaitGenerateResponseParams = Omit<
  BaseGenerateResponseMessageParams,
  "dataStreamer"
>;

export async function awaitGenerateResponseMessage({
  reqId,
  llmConversation,
  llm,
  llmNotWorkingMessage,
  noRelevantContentMessage,
  request,
  references,
  conversation,
  shouldGenerateMessage = true,
}: AwaitGenerateResponseParams): Promise<GenerateResponseReturnValue> {
  const newMessages: SomeMessage[] = [];
  const outputReferences: References = [];

  if (references) {
    outputReferences.push(...references);
  }

  if (shouldGenerateMessage) {
    try {
      logRequest({
        reqId,
        message: `All messages for LLM: ${JSON.stringify(llmConversation)}`,
      });
      const answer = await llm.answerQuestionAwaited({
        messages: llmConversation,
      });
      newMessages.push(convertMessageFromLlmToDb(answer));

      // LLM responds with tool call
      if (answer?.function_call) {
        assert(
          llm.callTool,
          "You must implement the callTool() method on your ChatLlm to access this code."
        );
        const toolAnswer = await llm.callTool({
          messages: [...llmConversation, ...newMessages],
          conversation,
          request,
        });
        logRequest({
          reqId,
          message: `LLM tool call: ${JSON.stringify(toolAnswer)}`,
        });
        const {
          toolCallMessage,
          references: toolReferences,
          rejectUserQuery,
        } = toolAnswer;
        newMessages.push(convertMessageFromLlmToDb(toolCallMessage));
        // Update references from tool call
        if (toolReferences) {
          outputReferences.push(...toolReferences);
        }
        // Return static response if query rejected by tool call
        if (rejectUserQuery) {
          newMessages.push({
            role: "assistant",
            content: noRelevantContentMessage,
          });
        } else {
          // Otherwise respond with LLM again
          const answer = await llm.answerQuestionAwaited({
            messages: [...llmConversation, ...newMessages],
            // Only allow 1 tool call per user message.
          });
          newMessages.push(convertMessageFromLlmToDb(answer));
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : JSON.stringify(err);
      logRequest({
        reqId,
        message: `LLM error: ${errorMessage}`,
        type: "error",
      });
      logRequest({
        reqId,
        message: "Only sending vector search results to user",
      });
      const llmNotWorkingResponse = {
        role: "assistant",
        content: llmNotWorkingMessage,
        references,
      } satisfies AssistantMessage;
      newMessages.push(llmNotWorkingResponse);
    }
  }
  // Add references to the last assistant message (excluding function calls)
  if (
    newMessages.at(-1)?.role === "assistant" &&
    !(newMessages.at(-1) as AssistantMessage).functionCall &&
    outputReferences.length > 0
  ) {
    (newMessages.at(-1) as AssistantMessage).references = outputReferences;
  }
  return { messages: newMessages };
}

export type StreamGenerateResponseParams = BaseGenerateResponseMessageParams &
  Required<Pick<GenerateResponseParams, "dataStreamer">> & {
    /**
      Arbitrary data about the message to stream before the generated response.
    */
    metadata?: Record<string, unknown>;
  };

export async function streamGenerateResponseMessage({
  dataStreamer,
  llm,
  llmConversation,
  reqId,
  references,
  noRelevantContentMessage,
  llmNotWorkingMessage,
  conversation,
  request,
  metadata,
  shouldGenerateMessage,
}: StreamGenerateResponseParams): Promise<GenerateResponseReturnValue> {
  const newMessages: SomeMessage[] = [];
  const outputReferences: References = [];

  if (references) {
    outputReferences.push(...references);
  }

  if (metadata) {
    dataStreamer.streamData({ type: "metadata", data: metadata });
  }
  if (shouldGenerateMessage) {
    try {
      console.log("msgs", llmConversation);
      const answerStream = await llm.answerQuestionStream({
        messages: llmConversation,
      });
      const initialAssistantMessage: AssistantMessage = {
        role: "assistant",
        content: "",
      };

      for await (const event of answerStream) {
        if (event.choices.length === 0) {
          continue;
        }
        // The event could contain many choices, but we only want the first one
        const choice = event.choices[0];

        // Assistant response to user
        if (choice.delta?.content) {
          const content = escapeNewlines(choice.delta.content ?? "");
          dataStreamer.streamData({
            type: "delta",
            data: content,
          });
          initialAssistantMessage.content += content;
        } else if (choice.delta) {
          logRequest({
            reqId,
            message: `Unexpected message in stream: no delta. Message: ${JSON.stringify(
              choice.delta.content
            )}`,
            type: "warn",
          });
        }
      }

      newMessages.push(initialAssistantMessage);

      logRequest({
        reqId,
        message: `LLM response: ${JSON.stringify(initialAssistantMessage)}`,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : JSON.stringify(err);
      logRequest({
        reqId,
        message: `LLM error: ${errorMessage}`,
        type: "error",
      });
      logRequest({
        reqId,
        message: "Only sending vector search results to user",
      });
      const llmNotWorkingResponse = {
        role: "assistant",
        content: llmNotWorkingMessage,
      } satisfies AssistantMessage;
      dataStreamer.streamData({
        type: "delta",
        data: llmNotWorkingMessage,
      });
      newMessages.push(llmNotWorkingResponse);
    }
  }
  // Handle streaming static message response
  else {
    const staticMessage = llmConversation.at(-1);
    assert(staticMessage?.content, "No static message content");
    assert(staticMessage.role === "assistant", "Static message not assistant");
    logRequest({
      reqId,
      message: `Sending static message to user: ${staticMessage.content}`,
      type: "warn",
    });
    dataStreamer.streamData({
      type: "delta",
      data: staticMessage.content,
    });
  }

  // Add references to the last assistant message
  if (newMessages.at(-1)?.role === "assistant" && outputReferences.length > 0) {
    (newMessages.at(-1) as AssistantMessage).references = outputReferences;
  }
  if (outputReferences.length > 0) {
    // Stream back references
    dataStreamer.streamData({
      type: "references",
      data: outputReferences,
    });
  }

  return { messages: newMessages.map(convertMessageFromLlmToDb) };
}

export function convertMessageFromLlmToDb(
  message: OpenAiChatMessage
): SomeMessage {
  const dbMessage = {
    ...message,
    content: message?.content ?? "",
  };
  if (message.role === "assistant" && message.function_call) {
    (dbMessage as AssistantMessage).functionCall = message.function_call;
  }

  return dbMessage;
}

function convertConversationMessageToLlmMessage(
  message: SomeMessage
): OpenAiChatMessage {
  const { content, role } = message;
  if (role === "system") {
    return {
      content: content,
      role: "system",
    } satisfies OpenAiChatMessage;
  }
  if (role === "function") {
    return {
      content: content,
      role: "function",
      name: message.name,
    } satisfies OpenAiChatMessage;
  }
  if (role === "user") {
    return {
      content: content,
      role: "user",
    } satisfies OpenAiChatMessage;
  }
  if (role === "assistant") {
    return {
      content: content,
      role: "assistant",
      ...(message.functionCall ? { function_call: message.functionCall } : {}),
    } satisfies OpenAiChatMessage;
  }
  throw new Error(`Invalid message role: ${role}`);
}
