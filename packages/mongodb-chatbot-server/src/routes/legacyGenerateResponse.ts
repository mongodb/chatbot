import {
  FindContentFunc,
  EmbeddedContent,
  UserMessage,
  References,
  SomeMessage,
  escapeNewlines,
  OpenAiChatMessage,
  AssistantMessage,
  ChatLlm,
  SystemMessage,
  Conversation,
  ConversationCustomData,
} from "mongodb-rag-core";
import { QueryPreprocessorFunc, MakeReferenceLinksFunc } from "../processors";
import { logRequest } from "../utils";
import { strict as assert } from "assert";
import { FilterPreviousMessages } from "../processors/FilterPreviousMessages";
import {
  GenerateResponseParams,
  GenerateResponseReturnValue,
} from "./conversations/addMessageToConversation";

export type GenerateUserPromptFuncParams = {
  /**
    Original user message
   */
  userMessageText: string;

  /**
    Conversation with preceding messages
   */
  conversation?: Conversation;

  /**
    Additional contextual information provided by the user's client. This can
    include arbitrary data that might be useful for generating a response. For
    example, this could include the user's location, the device they are using,
    their preferred programming language, etc.
   */
  clientContext?: Record<string, unknown>;

  /**
    String Id for request
   */
  reqId: string;

  /**
    Custom data for the message request.
   */
  customData?: ConversationCustomData;
};

export interface GenerateUserPromptFuncReturnValue {
  /**
    If defined, this message should be sent as a response instead of generating
    a response to the user query with the LLM.
   */
  staticResponse?: AssistantMessage;

  /**
    If true, no response should be generated with an LLM. Instead, return the
    `staticResponse` if set or otherwise respond with a standard static
    rejection response.
   */
  rejectQuery?: boolean;

  /**
    The (preprocessed) user message to insert into the conversation.
   */
  userMessage: UserMessage;

  /**
    References returned with the LLM response
   */
  references?: References;
}

/**
  Generate the user prompt sent to the {@link ChatLlm}.
  This function is a flexible construct that you can use to customize
  the chatbot behavior. For example, you can use this function to
  perform retrieval augmented generation (RAG) or chain of thought prompting.
  Include whatever logic in here to construct the user message
  that the LLM responds to.

  If you are doing RAG, this can include the content from vector search.
 */
export type GenerateUserPromptFunc = (
  params: GenerateUserPromptFuncParams
) => Promise<GenerateUserPromptFuncReturnValue>;

export interface MakeRagGenerateUserPromptParams {
  /**
    Transform the user's message before sending it to the `findContent` function.
   */
  queryPreprocessor?: QueryPreprocessorFunc;

  /**
    Find content based on the user's message and preprocessing.
   */
  findContent: FindContentFunc;

  /**
    If not specified, uses {@link makeDefaultReferenceLinks}.
   */
  makeReferenceLinks?: MakeReferenceLinksFunc;

  /**
    Number of tokens from the found context to send to the `makeUserMessage` function.
    All chunks that exceed this threshold are discarded.
   */
  maxChunkContextTokens?: number;

  /**
    Construct user message which is sent to the LLM and stored in the database.
   */
  makeUserMessage: MakeUserMessageFunc;
}

export interface MakeUserMessageFuncParams {
  content: EmbeddedContent[];
  originalUserMessage: string;
  preprocessedUserMessage?: string;
  queryEmbedding?: number[];
  rejectQuery?: boolean;
}

export type MakeUserMessageFunc = (
  params: MakeUserMessageFuncParams
) => Promise<UserMessage>;
export interface MakeLegacyGenerateResponseParams {
  llm: ChatLlm;
  generateUserPrompt?: GenerateUserPromptFunc;
  filterPreviousMessages?: FilterPreviousMessages;
  llmNotWorkingMessage: string;
  noRelevantContentMessage: string;
  systemMessage: SystemMessage;
}

/**
  @deprecated Make legacy generate response conform to the current system.
  To be replaced later in a later PR in this epic.
 */
export function makeLegacyGeneratateResponse({
  llm,
  generateUserPrompt,
  filterPreviousMessages,
  llmNotWorkingMessage,
  noRelevantContentMessage,
  systemMessage,
}: MakeLegacyGenerateResponseParams) {
  return async function generateResponse({
    shouldStream,
    latestMessageText,
    clientContext,
    customData,
    dataStreamer,
    reqId,
    conversation,
    request,
  }: GenerateResponseParams): Promise<GenerateResponseReturnValue> {
    const { userMessage, references, staticResponse, rejectQuery } =
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
    // Add request custom data to user message.
    const userMessageWithCustomData = customData
      ? {
          ...userMessage,
          // Override request custom data fields with user message custom data fields.
          customData: { ...customData, ...(userMessage.customData ?? {}) },
        }
      : userMessage;
    const newMessages: SomeMessage[] = [userMessageWithCustomData];

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
        systemMessage,
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
        systemMessage,
      });
      newMessages.push(...messages);
    }
    return { messages: newMessages };
  };
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
}: AwaitGenerateResponseParams &
  MakeLegacyGenerateResponseParams): Promise<GenerateResponseReturnValue> {
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
  if (newMessages.at(-1)?.role === "assistant" && outputReferences.length > 0) {
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
}: StreamGenerateResponseParams &
  MakeLegacyGenerateResponseParams): Promise<GenerateResponseReturnValue> {
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
      const answerStream = await llm.answerQuestionStream({
        messages: llmConversation,
      });
      const initialAssistantMessage: AssistantMessage = {
        role: "assistant",
        content: "",
      };
      const functionCallContent = {
        name: "",
        arguments: "",
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
        }
        // Tool call
        else if (choice.delta?.function_call) {
          if (choice.delta?.function_call.name) {
            functionCallContent.name += escapeNewlines(
              choice.delta?.function_call.name ?? ""
            );
          }
          if (choice.delta?.function_call.arguments) {
            functionCallContent.arguments += escapeNewlines(
              choice.delta?.function_call.arguments ?? ""
            );
          }
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
      const shouldCallTool = functionCallContent.name !== "";

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

  return { messages: newMessages };
}

export function convertMessageFromLlmToDb(
  message: OpenAiChatMessage
): SomeMessage {
  if (message.role === "function") {
    return {
      content: message.content ?? "",
      name: message.name,
      role: "tool", // Changed from "function" to "tool"
    };
  }

  // Handle other message types
  const dbMessage = {
    ...message,
    content: message?.content ?? "",
  };

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
  if (role === "tool") {
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
      ...(message.toolCall
        ? {
            function_call: {
              name: message.toolCall.function?.name || "",
              arguments:
                typeof message.toolCall.function === "object"
                  ? JSON.stringify(message.toolCall.function)
                  : "{}",
            },
          }
        : {}),
    } satisfies OpenAiChatMessage;
  }
  throw new Error(`Invalid message role: ${role}`);
}
