import { useCallback, useMemo, useState } from "react";
import { type References } from "mongodb-rag-core";
import {
  MessageData,
  ConversationService,
  ConversationFetchOptions,
  AssistantMessageMetadata,
} from "./services/conversations";
import createMessage, { createMessageId } from "./createMessage";
import {
  countRegexMatches,
  removeArrayElementAt,
  updateArrayElementAt,
  canUseServerSentEvents,
} from "./utils";
import { makePrioritizeCurrentMongoDbReferenceDomain } from "./messageLinks";
import { SortReferences } from "./sortReferences";

const STREAMING_MESSAGE_ID = "streaming-response";

export type ConversationState = {
  conversationId?: string;
  messages: MessageData[];
  error?: string;
  isStreamingMessage: boolean;
  streamingMessage?: MessageData;
};

type ConversationAction =
  | { type: "setConversation"; conversation: Required<ConversationState> }
  | { type: "setConversationError"; errorMessage: string }
  | {
      type: "addMessage";
      role: "assistant";
      content: string;
      references?: References;
      metadata?: AssistantMessageMetadata;
    }
  | {
      type: "addMessage";
      role: "user";
      content: string;
    }
  | { type: "setMessageContent"; messageId: MessageData["id"]; content: string }
  | {
      type: "setMessageMetadata";
      messageId: MessageData["id"];
      metadata: AssistantMessageMetadata;
    }
  | { type: "deleteMessage"; messageId: MessageData["id"] }
  | { type: "rateMessage"; messageId: MessageData["id"]; rating: boolean }
  | { type: "createStreamingResponse"; data: string }
  | { type: "appendStreamingResponse"; data: string }
  | {
      type: "appendStreamingReferences";
      data: References;
    }
  | { type: "finishStreamingResponse"; messageId: MessageData["id"] }
  | { type: "cancelStreamingResponse" };

/**
 * Converts a ConversationAction type to a an object that contains the
 * action event without its `type` field. This can be used an argument
 * to the corresponding "actor" function.
 */
type ConversationActorArgs<K extends ConversationAction["type"]> = Omit<
  Extract<ConversationAction, { type: K }>,
  "type"
>;

type ConversationActor = {
  createConversation: () => Promise<void>;
  endConversationWithError: (errorMessage: string) => void;
  addMessage: (
    args:
      | { role: "user"; content: string }
      | {
          role: "assistant";
          content: string;
          references?: References;
          metadata?: AssistantMessageMetadata;
        }
  ) => Promise<void>;
  setMessageContent: (messageId: string, content: string) => Promise<void>;
  setMessageMetadata: (
    args: ConversationActorArgs<"setMessageMetadata">
  ) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  rateMessage: (messageId: string, rating: boolean) => Promise<void>;
  commentMessage: (messageId: string, comment: string) => Promise<void>;
  switchConversation: (conversationId: string) => Promise<void>;

  // Streaming State
  createStreamingResponse: (data: string) => void;
  appendStreamingResponse: (data: string) => void;
  appendStreamingReferences: (references: References) => void;
  finishStreamingResponse: (messageId: string) => void;
  cancelStreamingResponse: () => void;
};

export type Conversation = ConversationState & ConversationActor;

export const defaultConversationState = {
  messages: [],
  error: "",
  isStreamingMessage: false,
} satisfies ConversationState;

function getMessageIndex(
  messages: MessageData[],
  messageId: MessageData["id"]
) {
  const messageIndex = messages.findIndex(
    (message) => message.id === messageId
  );
  return messageIndex;
}
function getStreamingMessage(messages: MessageData[]) {
  const streamingMessageIndex = getMessageIndex(messages, STREAMING_MESSAGE_ID);
  const streamingMessage =
    streamingMessageIndex === -1 ? null : messages[streamingMessageIndex];
  return {
    streamingMessageIndex,
    streamingMessage,
  };
}

function useConversationState(conversationService: ConversationService): {
  state: ConversationState;
  actions: ConversationActor;
} {
  const [state, setState] = useState<ConversationState>({
    conversationId: undefined,
    messages: [],
    error: undefined,
    isStreamingMessage: false,
    streamingMessage: undefined,
  });

  const setConversation = useCallback(
    (conversation: Required<ConversationState>) => {
      setState((_) => conversation);
    },
    []
  );

  const endConversationWithError = useCallback((errorMessage: string) => {
    setState((prevState) => ({
      ...prevState,
      error: errorMessage,
    }));
  }, []);

  const createConversation = useCallback(async () => {
    try {
      const conversation = await conversationService.createConversation();
      setConversation({
        ...conversation,
        error: "",
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
  }, [conversationService, setConversation, endConversationWithError]);

  const addMessage = useCallback<ConversationActor["addMessage"]>(
    async ({ role, content }) => {
      setState((prevState) => ({
        ...prevState,
        messages: [
          ...prevState.messages,
          createMessage({
            role,
            content,
          }),
        ],
      }));
    },
    []
  );

  const setMessageContent = useCallback(
    async (messageId: string, content: string) => {
      setState((prevState) => {
        if (!prevState.conversationId) {
          console.error(`Cannot setMessageContent without a conversationId`);
          return prevState;
        }
        const messageIndex = getMessageIndex(prevState.messages, messageId);
        if (messageIndex === -1) {
          console.error(
            `Cannot setMessageContent because message with id ${messageId} does not exist`
          );
          return prevState;
        }
        return {
          ...prevState,
          messages: [
            ...prevState.messages.slice(0, messageIndex),
            {
              ...prevState.messages[messageIndex],
              content,
            },
            ...prevState.messages.slice(messageIndex + 1),
          ],
        };
      });
    },
    []
  );

  const setMessageMetadata = useCallback<
    ConversationActor["setMessageMetadata"]
  >(async ({ messageId, metadata }) => {
    setState((prevState) => {
      if (!prevState.conversationId) {
        console.error(`Cannot setMessageMetadata without a conversationId`);
        return prevState;
      }
      const messageIndex = getMessageIndex(prevState.messages, messageId);
      if (messageIndex === -1) {
        console.error(
          `Cannot setMessageMetadata because message with id ${messageId} does not exist`
        );
        return prevState;
      }
      const existingMessage = prevState.messages[messageIndex];
      if (existingMessage.role !== "assistant") {
        console.error(
          `Cannot setMessageMetadata because message with id ${messageId} is not an assistant message`
        );
        return prevState;
      }
      return {
        ...prevState,
        messages: [
          ...prevState.messages.slice(0, messageIndex),
          {
            ...existingMessage,
            metadata,
          },
          ...prevState.messages.slice(messageIndex + 1),
        ],
      };
    });
  }, []);

  const createStreamingResponse = useCallback((data: string) => {
    setState((prevState) => {
      if (!prevState.conversationId) {
        console.error(
          `Cannot createStreamingResponse without a conversationId`
        );
        return prevState;
      }
      let { streamingMessage } = getStreamingMessage(prevState.messages);
      if (streamingMessage) {
        console.error(
          `Cannot createStreamingResponse because a streamingMessage already exists`
        );
        return prevState;
      }
      streamingMessage = {
        ...createMessage({
          role: "assistant",
          content: data,
        }),
        id: STREAMING_MESSAGE_ID,
      };
      return {
        ...prevState,
        isStreamingMessage: true,
        streamingMessage,
        messages: [...prevState.messages, streamingMessage],
      };
    });
  }, []);

  const appendStreamingResponse = useCallback((data: string) => {
    setState((prevState) => {
      if (!prevState.conversationId) {
        console.error(
          `Cannot appendStreamingResponse without a conversationId`
        );
        return prevState;
      }
      const { streamingMessage, streamingMessageIndex } = getStreamingMessage(
        prevState.messages
      );
      if (!streamingMessage) {
        console.error(
          `Cannot appendStreamingResponse without a streamingMessage. Make sure to call createStreamingResponse first.`
        );
        return prevState;
      }
      return {
        ...prevState,
        messages: updateArrayElementAt(
          prevState.messages,
          streamingMessageIndex,
          {
            ...streamingMessage,
            content: streamingMessage.content + data,
          }
        ),
      };
    });
  }, []);

  const appendStreamingReferences = useCallback((data: References) => {
    setState((prevState) => {
      if (!prevState.conversationId) {
        console.error(
          `Cannot appendStreamingReferences without a conversationId`
        );
        return prevState;
      }
      const { streamingMessage, streamingMessageIndex } = getStreamingMessage(
        prevState.messages
      );
      if (!streamingMessage) {
        console.error(
          `Cannot appendStreamingReferences without a streamingMessage. Make sure to call createStreamingResponse first.`
        );
        return prevState;
      }

      return {
        ...prevState,
        messages: updateArrayElementAt(
          prevState.messages,
          streamingMessageIndex,
          {
            ...streamingMessage,
            references: [...(streamingMessage.references ?? []), ...data],
          }
        ),
      };
    });
  }, []);

  const finishStreamingResponse = useCallback((messageId: string) => {
    setState((prevState) => {
      if (!prevState.conversationId) {
        console.error(
          `Cannot finishStreamingResponse without a conversationId`
        );
        return prevState;
      }
      const { streamingMessage, streamingMessageIndex } = getStreamingMessage(
        prevState.messages
      );
      if (!streamingMessage) {
        console.error(
          `Cannot finishStreamingResponse without a streamingMessage`
        );
        return prevState;
      }
      return {
        ...prevState,
        isStreamingMessage: false,
        streamingMessage: undefined,
        messages: updateArrayElementAt(
          prevState.messages,
          streamingMessageIndex,
          {
            ...streamingMessage,
            id: messageId ?? createMessageId(),
          }
        ),
      };
    });
  }, []);

  const cancelStreamingResponse = useCallback(() => {
    setState((prevState) => {
      if (!prevState.conversationId) {
        console.error(
          `Cannot cancelStreamingResponse without a conversationId`
        );
        return prevState;
      }
      const { streamingMessage, streamingMessageIndex } = getStreamingMessage(
        prevState.messages
      );
      if (!streamingMessage) {
        console.error(
          `Cannot cancelStreamingResponse without a streamingMessage`
        );
        return prevState;
      }
      return {
        ...prevState,
        isStreamingMessage: false,
        streamingMessage: undefined,
        messages: removeArrayElementAt(
          prevState.messages,
          streamingMessageIndex
        ),
      };
    });
  }, []);

  const deleteMessage = useCallback(async (messageId: string) => {
    setState((prevState) => {
      if (!prevState.conversationId) {
        console.error(`Cannot deleteMessage without a conversationId`);
        return prevState;
      }
      const messageIndex = getMessageIndex(prevState.messages, messageId);
      if (messageIndex === -1) {
        console.error(
          `Cannot deleteMessage because message with id ${messageId} does not exist`
        );
        return prevState;
      }
      return {
        ...prevState,
        messages: removeArrayElementAt(prevState.messages, messageIndex),
      };
    });
  }, []);

  const rateMessage = useCallback(
    async (messageId: string, rating: boolean) => {
      setState((prevState) => {
        if (!prevState.conversationId) {
          console.error(`Cannot rateMessage without a conversationId`);
          return prevState;
        }
        const messageIndex = getMessageIndex(prevState.messages, messageId);
        if (messageIndex === -1) {
          console.error(
            `Cannot rateMessage because message with id ${messageId} does not exist`
          );
          return prevState;
        }
        const ratedMessage = {
          ...prevState.messages[messageIndex],
          rating,
        };
        return {
          ...prevState,
          messages: updateArrayElementAt(
            prevState.messages,
            messageIndex,
            ratedMessage
          ),
        };
      });
    },
    []
  );

  const commentMessage = useCallback(
    async (messageId: string, comment: string) => {
      setState((prevState) => {
        if (!prevState.conversationId) {
          console.error(`Cannot commentMessage without a conversationId`);
          return prevState;
        }
        const messageIndex = getMessageIndex(prevState.messages, messageId);
        if (messageIndex === -1) {
          console.error(
            `Cannot commentMessage because message with id ${messageId} does not exist`
          );
          return prevState;
        }
        const commentedMessage = {
          ...prevState.messages[messageIndex],
          comment,
        };
        return {
          ...prevState,
          messages: updateArrayElementAt(
            prevState.messages,
            messageIndex,
            commentedMessage
          ),
        };
      });
    },
    []
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
        setConversation({
          ...conversation,
          error: "",
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
    [conversationService, setConversation]
  );

  return {
    state,
    actions: {
      createConversation,
      endConversationWithError,
      addMessage,
      setMessageContent,
      setMessageMetadata,
      deleteMessage,
      rateMessage,
      commentMessage,
      switchConversation,
      createStreamingResponse,
      appendStreamingResponse,
      appendStreamingReferences,
      finishStreamingResponse,
      cancelStreamingResponse,
    },
  };
}

export type UseConversationParams = {
  serverBaseUrl: string;
  shouldStream?: boolean;
  sortMessageReferences?: SortReferences;
  fetchOptions?: ConversationFetchOptions;
};

export function useConversation(params: UseConversationParams) {
  const conversationService = useMemo(() => {
    return new ConversationService({
      serverUrl: params.serverBaseUrl,
      fetchOptions: params.fetchOptions,
    });
  }, [params.serverBaseUrl, params.fetchOptions]);

  const { state, actions } = useConversationState(conversationService);

  // Use a custom sort function if provided. If undefined and we're on a
  // well-known MongoDB domain, then prioritize links to the current domain.
  // Otherwise leave everything as is.
  const sortMessageReferences =
    params.sortMessageReferences ??
    makePrioritizeCurrentMongoDbReferenceDomain();

  const addMessage = useCallback<ConversationActor["addMessage"]>(
    async ({ role, content }) => {
      if (!state.conversationId) {
        console.error(`Cannot addMessage without a conversationId`);
        return;
      }

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
          actions.appendStreamingResponse(nextToken);
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
            actions.appendStreamingResponse("\n```\n\n");
          }
          actions.appendStreamingReferences(
            references.sort(sortMessageReferences)
          );
          references = null;
        }
        if (!finishedBuffering && allBufferedTokensDispatched) {
          if (!streamedMessageId) {
            streamedMessageId = createMessageId();
          }
          actions.finishStreamingResponse(streamedMessageId);
          finishedBuffering = true;
        }
      }, streamingIntervalMs);

      try {
        await actions.addMessage({ role, content });
        if (shouldStream) {
          actions.createStreamingResponse("");
          await conversationService.addMessageStreaming({
            conversationId: state.conversationId,
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
              actions.setMessageMetadata({
                messageId: STREAMING_MESSAGE_ID,
                metadata,
              });
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
          actions.createStreamingResponse("");
          const response = await conversationService.addMessage({
            conversationId: state.conversationId,
            message: content,
          });
          actions.cancelStreamingResponse();
          actions.addMessage({
            role: "assistant",
            content: response.content,
            references: response.references?.sort(sortMessageReferences),
            metadata: response.metadata,
          });
        }
      } catch (error) {
        abortController.abort();
        console.error(`Failed to add message: ${error}`);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        actions.cancelStreamingResponse();
        clearInterval(streamingInterval);

        actions.endConversationWithError(errorMessage);
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
    },
    [
      params.shouldStream,
      conversationService,
      state.conversationId,
      actions,
      sortMessageReferences,
    ]
  );

  const streamingMessage = state.messages.find(
    (m) => m.id === STREAMING_MESSAGE_ID
  );

  return useMemo(
    () =>
      ({
        ...state,
        ...actions,
        addMessage,
        streamingMessage,
      } satisfies Conversation),
    [state, actions, addMessage, streamingMessage]
  );
}
