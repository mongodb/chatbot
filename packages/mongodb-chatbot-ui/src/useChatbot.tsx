import { useRef, useState } from "react";
import { useConversation } from "./useConversation";
import { ConversationFetchOptions } from "./services/conversations";

export type UseChatbotProps = {
  chatbotName?: string;
  isExperimental?: boolean;
  maxInputCharacters?: number;
  maxCommentCharacters?: number;
  serverBaseUrl?: string;
  shouldStream?: boolean;
  suggestedPrompts?: string[];
  fetchOptions?: ConversationFetchOptions;
  closeChatOverride?: () => boolean;
};

export type ChatbotData = {
  awaitingReply: boolean;
  canSubmit: (text: string) => boolean;
  chatbotName?: string;
  closeChat: () => boolean;
  conversation: ReturnType<typeof useConversation>;
  handleSubmit: (text: string) => void | Promise<void>;
  inputBarRef: React.RefObject<HTMLFormElement>;
  inputText: string;
  inputTextError: string;
  isExperimental: boolean;
  maxInputCharacters?: number;
  maxCommentCharacters?: number;
  initialOpen?: boolean;
  open: boolean;
  openChat: () => void;
  setInputText: (text: string) => void;
};

export function useChatbot(props: UseChatbotProps): ChatbotData {
  const conversation = useConversation({
    serverBaseUrl: props.serverBaseUrl,
    shouldStream: props.shouldStream,
    fetchOptions: props.fetchOptions,
  });
  const [open, setOpen] = useState(false);
  const [awaitingReply, setAwaitingReply] = useState(false);
  const inputBarRef = useRef<HTMLFormElement>(null);
  const chatbotName = props.chatbotName;
  const isExperimental = props.isExperimental ?? true;

  async function openChat() {
    if (open) {
      return;
    }
    setOpen(true);
    if (!conversation.conversationId) {
      await conversation.createConversation();
    }
  }

  function closeChat() {
    setOpen(false);
    return true;
  }

  const [inputData, setInputData] = useState({
    text: "",
    error: "",
  });
  const inputText = inputData.text;
  const inputTextError = inputData.error;
  function setInputText(text: string) {
    const isValid = props.maxInputCharacters
      ? text.length <= props.maxInputCharacters
      : true;
    setInputData({
      text,
      error: isValid
        ? ""
        : `Input must be less than ${props.maxInputCharacters} characters`,
    });
  }

  function canSubmit(text: string) {
    // Don't let users submit a message if the conversation hasn't fully loaded
    if (!conversation.conversationId) {
      console.error(`Cannot add message without a conversationId`);
      return false;
    }
    // Don't let users submit a message if something is wrong with their input text
    if (inputData.error) {
      console.error(`Cannot add message with invalid input text`);
      return false;
    }
    // Don't let users submit a message that is empty or only whitespace
    if (text.replace(/\s/g, "").length === 0) {
      console.error(`Cannot add message with no text`);
      return false;
    }
    // Don't let users submit a message if we're already waiting for a reply
    if (awaitingReply) {
      console.error(`Cannot add message while awaiting a reply`);
      return false;
    }
    return true;
  }

  async function handleSubmit(text: string) {
    if (!canSubmit(text)) return;
    try {
      setInputText("");
      setAwaitingReply(true);
      openChat();
      await conversation.addMessage("user", text);
    } catch (e) {
      console.error(e);
    } finally {
      setAwaitingReply(false);
    }
  }

  return {
    awaitingReply,
    canSubmit,
    chatbotName,
    closeChat: props.closeChatOverride ? props.closeChatOverride : closeChat,
    conversation,
    handleSubmit,
    inputBarRef,
    inputText,
    inputTextError,
    isExperimental,
    maxInputCharacters: props.maxInputCharacters,
    maxCommentCharacters: props.maxCommentCharacters,
    open,
    openChat,
    setInputText,
  };
}
