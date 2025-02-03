import { createStore } from "zustand";
import {
  AssistantMessageMetadata,
  MessageData,
} from "./services/conversations";
import { combine } from "zustand/middleware";
import createMessage, { CreateMessageArgs } from "./createMessage";
import { References } from "./references";
import { nonProd, removeArrayElementAt } from "./utils";

export type ConversationState = {
  conversationId?: string;
  error?: string;
  messages: MessageData[];
  streamingMessageId?: MessageData["id"];
};

export const initialConversationState: ConversationState = {
  conversationId: undefined,
  error: undefined,
  messages: [],
  streamingMessageId: undefined,
};

function updateMessage(
  messages: MessageData[],
  messageId: string,
  update: (message: MessageData) => MessageData
) {
  return messages.map((message) =>
    message.id === messageId ? update(message) : message
  );
}

export const STREAMING_MESSAGE_ID = "streaming-response";

function getStreamingMessage(messages: MessageData[]) {
  const index = messages.findIndex(
    (message) => message.id === STREAMING_MESSAGE_ID
  );
  const data = index === -1 ? null : messages[index];
  return {
    index,
    data,
  };
}

export type ConversationStore = ReturnType<typeof makeConversationStore>;

export const makeConversationStore = (name = "default") => {
  return createStore(
    combine(initialConversationState, (set, get) => ({
      name,
      api: {
        initialize: (initialState: ConversationState) => {
          set(initialState);
        },
        setConversationId: (conversationId: string) => {
          if (conversationId === "") {
            nonProd(() => {
              console.warn("Attempted to set an empty conversation ID");
            });
            return;
          }
          if (get().conversationId) {
            nonProd(() => {
              console.warn(
                "Attempted to set a conversation ID when one is already set"
              );
            });
            return;
          }
          set((prevState) => ({
            ...prevState,
            conversationId,
          }));
        },
        setConversationError: (errorMessage: string) => {
          set((prevState) => ({
            ...prevState,
            error: errorMessage,
          }));
        },
        addMessage: (messageData: MessageData | CreateMessageArgs) => {
          set((prevState) => ({
            ...prevState,
            messages: [...prevState.messages, createMessage(messageData)],
          }));
        },
        setMessageContent: (messageId: string, content: string) => {
          set((prevState) => ({
            ...prevState,
            messages: updateMessage(
              prevState.messages,
              messageId,
              (message) => ({
                ...message,
                content,
              })
            ),
          }));
        },
        updateMessageMetadata: (
          messageId: string,
          update: (
            metadata: AssistantMessageMetadata
          ) => AssistantMessageMetadata
        ) => {
          set((prevState) => ({
            ...prevState,
            messages: updateMessage(
              prevState.messages,
              messageId,
              (message) => ({
                ...message,
                metadata: update(message.metadata ?? {}),
              })
            ),
          }));
        },
        deleteMessage: (messageId: string) => {
          set((prevState) => {
            const updatedMessages = prevState.messages.filter(
              (message) => message.id !== messageId
            );
            if (updatedMessages.length === prevState.messages.length) {
              console.warn(`Message with id ${messageId} was not found`);
            }
            return {
              ...prevState,
              messages: updatedMessages,
            };
          });
        },
        rateMessage: (messageId: string, rating: boolean) => {
          set((prevState) => ({
            ...prevState,
            messages: updateMessage(
              prevState.messages,
              messageId,
              (message) => ({
                ...message,
                rating,
              })
            ),
          }));
        },
        createStreamingResponse: () => {
          set((prevState) => {
            const { index: streamingMessageIndex } = getStreamingMessage(
              prevState.messages
            );
            if (streamingMessageIndex !== -1) {
              console.warn(
                "Cannot create a new streaming response while one is already active"
              );
              return prevState;
            }

            return {
              ...prevState,
              messages: [
                ...prevState.messages,
                createMessage({
                  id: STREAMING_MESSAGE_ID,
                  role: "assistant",
                  content: "",
                }),
              ],
              streamingMessageId: STREAMING_MESSAGE_ID,
            };
          });
        },
        appendStreamingResponse: (newContent: string) => {
          set((prevState) => {
            const { index: streamingMessageIndex } = getStreamingMessage(
              prevState.messages
            );
            if (streamingMessageIndex === -1) {
              console.warn(
                "Attempted to append to a streaming response that does not exist"
              );
              return prevState;
            }

            return {
              ...prevState,
              messages: updateMessage(
                prevState.messages,
                STREAMING_MESSAGE_ID,
                (message) => ({
                  ...message,
                  content: message.content + newContent,
                })
              ),
            };
          });
        },
        appendStreamingReferences: (references: References) => {
          set((prevState) => {
            const { index: streamingMessageIndex } = getStreamingMessage(
              prevState.messages
            );
            if (streamingMessageIndex === -1) {
              console.warn(
                "Attempted to append references to a streaming response that does not exist"
              );
              return prevState;
            }

            return {
              ...prevState,
              messages: updateMessage(
                prevState.messages,
                STREAMING_MESSAGE_ID,
                (message) => ({
                  ...message,
                  references,
                })
              ),
            };
          });
        },
        finishStreamingResponse: (messageId: MessageData["id"]) => {
          set((prevState) => {
            const streamingMessage = getStreamingMessage(prevState.messages);
            if (streamingMessage.index === -1) {
              console.warn(
                "Cannot finish a streaming response that does not exist"
              );
              return prevState;
            }
            return {
              ...prevState,
              messages: updateMessage(
                prevState.messages,
                STREAMING_MESSAGE_ID,
                (message) => ({
                  ...message,
                  id: messageId,
                })
              ),
              streamingMessageId: undefined,
            };
          });
        },
        cancelStreamingResponse: () => {
          set((prevState) => {
            const streamingMessage = getStreamingMessage(prevState.messages);
            if (streamingMessage.index === -1) {
              console.warn(
                "Cannot cancel a streaming response that does not exist"
              );
              return prevState;
            }
            return {
              ...prevState,
              messages: removeArrayElementAt(
                prevState.messages,
                streamingMessage.index
              ),
              streamingMessageId: undefined,
            };
          });
        },
      },
    }))
  );
};
