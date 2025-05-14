import { useCallback, useMemo } from "react";
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
import { useZustand } from "use-zustand";

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
  /**
   * Optional fetch options for the ConversationService. Can be either a static
   * `ConversationFetchOptions` object for all request or a function that
   * dynamically returns a new `ConversationFetchOptions` object for each request.
   */
  fetchOptions?: ConversationFetchOptions | (() => ConversationFetchOptions);
  getClientContext?: () => Record<string, unknown>;
};

export function useConversation(params: UseConversationParams): Conversation {
  const store = useConversationStateContext();

  // Use the custom useZustand hook to subscribe to the store
  const conversationState = useZustand(
    store,
    (state) => state, // Select the entire state
    Object.is // Use Object.is for shallow comparison
  );

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

  const endConversationWithError = useCallback(
    (errorMessage: string) => {
      store.getState().api.setConversationError(errorMessage);
    },
    [store]
  );

  const createConversation = useCallback(async () => {
    try {
      const conversation = await conversationService.createConversation();
      store.getState().api.initialize({
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
  }, [conversationService, store, endConversationWithError]);

  const submit = useCallback(
    async (content: string) => {
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

      // We need to manage the interval state within the hook
      let streamingInterval: ReturnType<typeof setInterval> | undefined;
      let cleanupInterval: ReturnType<typeof setInterval> | undefined;

      streamingInterval = setInterval(() => {
        const [nextToken, ...remainingTokens] = bufferedTokens;

        bufferedTokens = remainingTokens;

        if (nextToken) {
          store.getState().api.appendStreamingResponse(nextToken);
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
            store.getState().api.appendStreamingResponse("\n```\n\n");
          }

          store
            .getState()
            .api.appendStreamingReferences(
              references.sort(sortMessageReferences)
            );
          references = null;
        }
        if (!finishedBuffering && allBufferedTokensDispatched) {
          if (!streamedMessageId) {
            streamedMessageId = createMessageId();
          }
          store.getState().api.finishStreamingResponse(streamedMessageId);
          finishedBuffering = true;
        }
      }, streamingIntervalMs);

      try {
        store.getState().api.addMessage({
          role: "user",
          content,
        });
        if (shouldStream) {
          store.getState().api.createStreamingResponse();
          await conversationService.addMessageStreaming({
            conversationId: conversationState.conversationId ?? "null",
            message: content,
            clientContext: params.getClientContext?.(),
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
                store.getState().api.setConversationId(metadata.conversationId);
              }
              store
                .getState()
                .api.updateMessageMetadata(
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
          store.getState().api.createStreamingResponse();
          const response = await conversationService.addMessage({
            conversationId: conversationState.conversationId ?? "null",
            message: content,
            clientContext: params.getClientContext?.(),
          });
          if (response.metadata?.conversationId) {
            store
              .getState()
              .api.setConversationId(response.metadata.conversationId);
          }
          store.getState().api.cancelStreamingResponse();
          store.getState().api.addMessage(response);
        }
      } catch (error) {
        abortController.abort();
        console.error(`Failed to add message: ${error}`);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        store.getState().api.cancelStreamingResponse();
        clearInterval(streamingInterval);
        endConversationWithError(errorMessage);
        throw error;
      }

      return new Promise<void>((resolve) => {
        cleanupInterval = setInterval(() => {
          if (finishedBuffering) {
            clearInterval(streamingInterval);
            clearInterval(cleanupInterval);
            resolve();
          }
        }, streamingIntervalMs);
      });
    },
    [
      params.shouldStream,
      params.getClientContext,
      sortMessageReferences,
      store,
      conversationService,
      conversationState.conversationId,
      endConversationWithError,
    ]
  );

  const getMessage = useCallback(
    (messageId: string) => {
      return store
        .getState()
        .messages.find((message) => message.id === messageId);
    },
    [store]
  );

  const rateMessage = useCallback(
    async (messageId: string, rating: boolean) => {
      if (!conversationState.conversationId) {
        console.error(`Cannot rateMessage without a conversationId`);
        return;
      }
      await conversationService.rateMessage({
        conversationId: conversationState.conversationId,
        messageId,
        rating,
      });
      store.getState().api.rateMessage(messageId, rating);
    },
    [conversationService, conversationState.conversationId, store]
  );

  const commentMessage = useCallback(
    async (messageId: string, comment: string) => {
      if (!conversationState.conversationId) {
        console.error(`Cannot commentMessage without a conversationId`);
        return;
      }
      await conversationService.commentMessage({
        conversationId: conversationState.conversationId,
        messageId,
        comment,
      });
    },
    [conversationService, conversationState.conversationId]
  );

  /**
   * Switch to a different, existing conversation.
   */
  const switchConversation = useCallback(
    async (conversationId: string) => {
      try {
        const conversation = await conversationService.getConversation(
          conversationId
        );
        store.getState().api.initialize({
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
    },
    [conversationService, store]
  );

  return {
    ...conversationState,
    createConversation,
    submit,
    getMessage,
    rateMessage,
    commentMessage,
    switchConversation,
  };
}
