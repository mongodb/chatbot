import { useMemo, useReducer } from "react";
import {
  ApiMessageData,
  Role,
  ApiConversationService,
} from "./services/apiConversations";
import createMessage from "./createMessage";
import { removeArrayElementAt } from "./utils";

const LOADING_MESSAGE_ID = "chatbot-loading-message";

export type ApiConversationState = {
  conversationId?: string;
  messages: ApiMessageData[];
  loading: boolean;
  loadingMessage?: ApiMessageData;
  error?: string;
};

type ApiConversationAction =
  | { type: "setConversation"; conversation: Required<ApiConversationState> }
  | { type: "setConversationError"; errorMessage: string }
  | { type: "addMessage"; role: Role; content: string }
  | { type: "modifyMessage"; messageId: ApiMessageData["id"]; content: string }
  | { type: "deleteMessage"; messageId: ApiMessageData["id"] }
  | { type: "rateMessage"; messageId: ApiMessageData["id"]; rating: boolean }
  | { type: "startLoading" }
  | { type: "endLoading" };

type ApiConversationActor = {
  createConversation: () => void;
  endConversationWithError: (errorMessage: string) => void;
  addMessage: (role: Role, content: string) => void;
  modifyMessage: (messageId: string, content: string) => void;
  deleteMessage: (messageId: string) => void;
  rateMessage: (messageId: string, rating: boolean) => void;
};

export type ApiConversation = ApiConversationState & ApiConversationActor;

export const defaultApiConversationState = {
  messages: [],
  error: "",
  loading: false,
} satisfies ApiConversationState;

function apiConversationReducer(
  state: ApiConversationState,
  action: ApiConversationAction
): ApiConversationState {
  function getMessageIndex(messageId: ApiMessageData["id"]) {
    const messageIndex = state.messages.findIndex(
      (message) => message.id === messageId
    );
    return messageIndex;
  }
  function getLoadingMessage() {
    const loadingMessageIndex = getMessageIndex(LOADING_MESSAGE_ID);
    const loadingMessage =
      loadingMessageIndex === -1 ? null : state.messages[loadingMessageIndex];
    return {
      loadingMessageIndex,
      loadingMessage,
    };
  }
  switch (action.type) {
    case "setConversation": {
      return {
        ...action.conversation,
        error: "",
      };
    }
    case "setConversationError": {
      return {
        ...state,
        error: action.errorMessage,
      };
    }
    case "addMessage": {
      if (!state.conversationId) {
        console.error(`Cannot addMessage without a conversationId`);
      }
      const newMessage = createMessage(action.role, action.content);
      return {
        ...state,
        messages: [...state.messages, newMessage],
      };
    }
    case "modifyMessage": {
      if (!state.conversationId) {
        console.error(`Cannot modifyMessage without a conversationId`);
        return state;
      }
      const messageIndex = getMessageIndex(action.messageId);
      if (messageIndex === -1) {
        console.error(
          `Cannot modifyMessage because message with id ${action.messageId} does not exist`
        );
        return state;
      }
      const modifiedMessage = {
        ...state.messages[messageIndex],
        content: action.content,
      };
      return {
        ...state,
        messages: [
          ...state.messages.slice(0, messageIndex),
          modifiedMessage,
          ...state.messages.slice(messageIndex + 1),
        ],
      };
    }
    case "deleteMessage": {
      if (!state.conversationId) {
        console.error(`Cannot deleteMessage without a conversationId`);
        return state;
      }
      const messageIndex = getMessageIndex(action.messageId);
      if (messageIndex === -1) {
        console.error(
          `Cannot deleteMessage because message with id ${action.messageId} does not exist`
        );
        return state;
      }
      return {
        ...state,
        messages: [
          ...state.messages.slice(0, messageIndex),
          ...state.messages.slice(messageIndex + 1),
        ],
      };
    }
    case "rateMessage": {
      if (!state.conversationId) {
        console.error(`Cannot rateMessage without a conversationId`);
        return state;
      }
      const messageIndex = getMessageIndex(action.messageId);
      if (messageIndex === -1) {
        console.error(
          `Cannot rateMessage because message with id ${action.messageId} does not exist`
        );
        return state;
      }

      const ratedMessage = {
        ...state.messages[messageIndex],
        rating: action.rating,
      };
      return {
        ...state,
        messages: [
          ...state.messages.slice(0, messageIndex),
          ratedMessage,
          ...state.messages.slice(messageIndex + 1),
        ],
      };
    }
    case "startLoading": {
      if (!state.conversationId) {
        console.error(`Cannot startLoading without a conversationId`);
        return state;
      }
      // if (state.loading) {
      //   console.error(
      //     `Cannot startLoading because loading is already true`
      //   );
      //   return state;
      // }
      const loadingMessage = {
        ...createMessage("assistant", ""),
        id: LOADING_MESSAGE_ID,
      };
      return {
        ...state,
        loading: true,
        messages: [...state.messages, loadingMessage],
      };
    }
    case "endLoading": {
      if (!state.loading) {
        console.error(`Cannot endLoading because loading is already false`);
        return state;
      }
      const { loadingMessage, loadingMessageIndex } = getLoadingMessage();
      if (!loadingMessage) {
        console.error(`Cannot endLoading because there is no loadingMessage`);
        return state;
      }

      const messages = removeArrayElementAt(
        state.messages,
        loadingMessageIndex
      );

      return {
        ...state,
        messages,
      };
    }
    default: {
      console.error("Unhandled action", action);
      throw new Error(`Unhandled action type`);
    }
  }
}

type UseApiConversationParams = {
  serverBaseUrl?: string;
  shouldStream?: boolean;
  apiCredentials?: {
    "atlas-admin-api": {
      publicApiKey: string;
      privateApiKey: string;
      organizationId: string;
      projectId: string;
      clusterId: string;
    };
  };
};

export function useApiConversation(params: UseApiConversationParams = {}) {
  const apiConversationService = useMemo(() => {
    return new ApiConversationService({
      serverUrl: params.serverBaseUrl ?? import.meta.env.VITE_SERVER_BASE_URL,
      apiCredentials: params.apiCredentials ?? {},
    });
  }, [params.serverBaseUrl]);

  const [state, _dispatch] = useReducer(
    apiConversationReducer,
    defaultApiConversationState
  );
  const dispatch = (...args: Parameters<typeof _dispatch>) => {
    if (import.meta.env.MODE !== "production") {
      console.log(`dispatch`, ...args);
    }
    _dispatch(...args);
  };

  const setConversation = (conversation: Required<ApiConversationState>) => {
    dispatch({ type: "setConversation", conversation });
  };

  const endConversationWithError = (errorMessage: string) => {
    dispatch({ type: "setConversationError", errorMessage });
  };

  const createConversation = async () => {
    try {
      if (state.conversationId) {
        console.error(
          `Cannot createConversation when conversationId already exists`
        );
        return;
      }
      const conversation = await apiConversationService.createConversation();
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
  };

  const addMessage = async (role: Role, content: string) => {
    if (!state.conversationId) {
      console.error(`Cannot addMessage without a conversationId`);
      return;
    }

    try {
      dispatch({ type: "addMessage", role, content });
      // We start a streaming response to indicate the loading state
      // but we'll never append to it since the response message comes
      // in all at once.
      dispatch({ type: "startLoading" });
      const response = await apiConversationService.addMessage({
        conversationId: state.conversationId,
        message: content,
      });
      dispatch({ type: "endLoading" });
      dispatch({
        type: "addMessage",
        role: "assistant",
        content: response.content,
      });
    } catch (error) {
      console.error(`Failed to add message: ${error}`);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      dispatch({ type: "endLoading" });
      endConversationWithError(errorMessage);
      throw error;
    }
  };

  const modifyMessage = async (messageId: string, content: string) => {
    if (!state.conversationId) {
      console.error(`Cannot modifyMessage without a conversationId`);
      return;
    }
    dispatch({ type: "modifyMessage", messageId, content });
  };

  const deleteMessage = async (messageId: string) => {
    if (!state.conversationId) {
      console.error(`Cannot deleteMessage without a conversationId`);
      return;
    }
    dispatch({ type: "deleteMessage", messageId });
  };

  const rateMessage = async (messageId: string, rating: boolean) => {
    if (!state.conversationId) {
      console.error(`Cannot rateMessage without a conversationId`);
      return;
    }
    await apiConversationService.rateMessage({
      conversationId: state.conversationId,
      messageId,
      rating,
    });
    dispatch({ type: "rateMessage", messageId, rating });
  };

  const loadingMessage = state.messages.find(
    (m) => m.id === LOADING_MESSAGE_ID
  );

  return {
    ...state,
    createConversation,
    endConversationWithError,
    addMessage,
    modifyMessage,
    deleteMessage,
    rateMessage,
    loadingMessage,
  } satisfies ApiConversation;
}
