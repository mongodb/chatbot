import { useMemo } from "react";
import {
  ConversationService,
  ConversationFetchOptions,
  AssistantMessageMetadata,
  MessageData,
} from "./services/conversations";
import createMessage, { createMessageId } from "./createMessage";
import { countRegexMatches, canUseServerSentEvents } from "./utils";
import { makePrioritizeCurrentMongoDbReferenceDomain } from "./messageLinks";
import { type References, SortReferences } from "./references";

import {
  type ConversationState,
  STREAMING_MESSAGE_ID,
} from "./conversationStore";
import { useConversationStateContext } from "./useConversationStateContext";

export type ConversationMethods = {
  createConversation: () => Promise<void>;
  switchConversation: (conversationId: string) => Promise<void>;
  submit: (content: string) => Promise<void>;
  getMessage: (messageId: string) => MessageData | undefined;
  rateMessage: (messageId: string, rating: boolean) => Promise<void>;
  commentMessage: (messageId: string, comment: string) => Promise<void>;
};

export type Conversation = ConversationState & ConversationMethods;

export type UseConversationParams = {
  serverBaseUrl: string;
  shouldStream?: boolean;
  sortMessageReferences?: SortReferences;
  fetchOptions?: ConversationFetchOptions;
};

export function useConversation(params: UseConversationParams) {
  const state = useConversationStateContext();
  const conversationService = useMemo(() => {
    return new ConversationService({
      serverUrl: params.serverBaseUrl,
      fetchOptions: params.fetchOptions,
    });
  }, [params.serverBaseUrl, params.fetchOptions]);

  // Use a custom sort function if provided. If undefined and we're on a
  // well-known MongoDB domain, then prioritize links to the current domain.
  // Otherwise leave everything as is.
  const sortMessageReferences =
    params.sortMessageReferences ??
    makePrioritizeCurrentMongoDbReferenceDomain();

  const endConversationWithError = (errorMessage: string) => {
    state.api.setConversationError(errorMessage);
  };

  const createConversation = async () => {
    try {
      const conversation = await conversationService.createConversation();
      state.api.initialize({
        conversationId: conversation._id,
        messages: conversation.messages.map(createMessage),
      });
    } catch (error) {
      const errorMessage =
        typeof error === "string"
          ? error
          : error instanceof Error
          ? error.message
          : "Failed to create conversation.";
      console.error(errorMessage);
      endConversationWithError(errorMessage);
    }
  };

  const submit = async (content: string) => {
    const shouldStream =
      canUseServerSentEvents() && (params.shouldStream ?? true);

    // Stream control
    const abortController = new AbortController();
    let finishedStreaming = false;
    let finishedBuffering = !shouldStream;
    let streamedMessageId: string | null = null;
    let references: References | null = null;
    let bufferedTokens: string[] = [];
    let streamedTokens: string[] = [];
    const streamingIntervalMs = 50;
    const streamingInterval = setInterval(() => {
      const [nextToken, ...remainingTokens] = bufferedTokens;

      bufferedTokens = remainingTokens;

      if (nextToken) {
        state.api.appendStreamingResponse(nextToken);
      }

      const allBufferedTokensDispatched =
        finishedStreaming && bufferedTokens.length === 0;

      if (references && allBufferedTokensDispatched) {
        // Count the number of markdown code fences in the response. If
        // it's odd, the streaming message stopped in the middle of a
        // code block and we need to escape from it.
        const numCodeFences = countRegexMatches(
          /```/g,
          streamedTokens.join("")
        );
        if (numCodeFences % 2 !== 0) {
          state.api.appendStreamingResponse("\n```\n\n");
        }

        state.api.appendStreamingReferences(
          references.sort(sortMessageReferences)
        );
        references = null;
      }
      if (!finishedBuffering && allBufferedTokensDispatched) {
        if (!streamedMessageId) {
          streamedMessageId = createMessageId();
        }
        state.api.finishStreamingResponse(streamedMessageId);
        finishedBuffering = true;
      }
    }, streamingIntervalMs);

    try {
      state.api.addMessage({
        role: "user",
        content,
      });
      if (shouldStream) {
        state.api.createStreamingResponse();
        await conversationService.addMessageStreaming({
          conversationId: state.conversationId ?? "null",
          message: content,
          maxRetries: 0,
          onResponseDelta: async (data: string) => {
            bufferedTokens = [...bufferedTokens, data];
            streamedTokens = [...streamedTokens, data];
          },
          onReferences: async (data: References) => {
            if (references === null) {
              references = [];
            }
            references.push(...data);
          },
          onMetadata: async (metadata) => {
            if (metadata?.conversationId) {
              state.api.setConversationId(metadata.conversationId);
            }
            state.api.updateMessageMetadata(
              STREAMING_MESSAGE_ID,
              (m) => ({ ...m, ...metadata } as AssistantMessageMetadata)
            );
          },
          onResponseFinished: async (messageId: string) => {
            streamedMessageId = messageId;
            finishedStreaming = true;
          },
          signal: abortController.signal,
        });
      } else {
        // We start a streaming response to indicate the loading state
        // but we'll never append to it since the response message comes
        // in all at once.
        state.api.createStreamingResponse();
        const response = await conversationService.addMessage({
          conversationId: state.conversationId ?? "null",
          message: content,
        });
        if (response.metadata?.conversationId) {
          state.api.setConversationId(response.metadata.conversationId);
        }
        state.api.cancelStreamingResponse();
        state.api.addMessage(response);
      }
    } catch (error) {
      abortController.abort();
      console.error(`Failed to add message: ${error}`);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      state.api.cancelStreamingResponse();
      clearInterval(streamingInterval);
      endConversationWithError(errorMessage);
      throw error;
    }

    let cleanupInterval: ReturnType<typeof setInterval> | undefined;
    return new Promise<void>((resolve) => {
      cleanupInterval = setInterval(() => {
        if (finishedBuffering) {
          clearInterval(streamingInterval);
          clearInterval(cleanupInterval);
          resolve();
        }
      }, streamingIntervalMs);
    });
  };

  const getMessage = (messageId: string) => {
    return state.messages.find((message) => message.id === messageId);
  };

  const rateMessage = async (messageId: string, rating: boolean) => {
    if (!state.conversationId) {
      console.error(`Cannot rateMessage without a conversationId`);
      return;
    }
    await conversationService.rateMessage({
      conversationId: state.conversationId,
      messageId,
      rating,
    });
    state.api.rateMessage(messageId, rating);
  };

  const commentMessage = async (messageId: string, comment: string) => {
    if (!state.conversationId) {
      console.error(`Cannot commentMessage without a conversationId`);
      return;
    }
    await conversationService.commentMessage({
      conversationId: state.conversationId,
      messageId,
      comment,
    });
  };

  /**
   * Switch to a different, existing conversation.
   */
  const switchConversation = async (conversationId: string) => {
    try {
      const conversation = await conversationService.getConversation(
        conversationId
      );
      state.api.initialize({
        conversationId: conversation._id,
        messages: conversation.messages.map(createMessage),
      });
    } catch (error) {
      const errorMessage =
        typeof error === "string"
          ? error
          : error instanceof Error
          ? error.message
          : "Failed to switch conversation.";
      console.error(errorMessage);
      // Rethrow the error so that we can handle it in the UI
      throw error;
    }
  };

  return {
    conversationId: state.conversationId,
    messages: state.messages,
    error: state.error,
    streamingMessageId: state.streamingMessageId,
    createConversation,
    submit,
    getMessage,
    rateMessage,
    commentMessage,
    switchConversation,
  } satisfies Conversation;
}
