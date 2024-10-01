import { useCallback, useEffect, useRef, useState } from "react";
import { useConversation, type UseConversationParams } from "./useConversation";

export type OpenCloseHandlers = {
  onOpen?: () => void;
  onClose?: () => void;
};

export type UseChatbotProps = OpenCloseHandlers &
  UseConversationParams & {
    chatbotName?: string;
    isExperimental?: boolean;
    maxInputCharacters?: number;
    maxCommentCharacters?: number;
  };

export type ChatbotData = {
  awaitingReply: boolean;
  canSubmit: (text: string) => boolean;

  closeChat: () => boolean;
  conversation: ReturnType<typeof useConversation>;
  handleSubmit: (text: string) => void | Promise<void>;
  inputBarRef: React.RefObject<HTMLFormElement>;
  inputText: string;
  inputTextError: string;
  chatbotName?: string;
  isExperimental: boolean;
  maxInputCharacters?: number;
  maxCommentCharacters?: number;
  open: boolean;
  openChat: () => void;
  setInputText: (text: string) => void;
};

export function useChatbot({
  onOpen,
  onClose,
  chatbotName,
  isExperimental = true,
  maxInputCharacters,
  maxCommentCharacters,
  ...useConversationArgs
}: UseChatbotProps): ChatbotData {
  const conversation = useConversation(useConversationArgs);
  const [open, setOpen] = useState(false);
  const [awaitingReply, setAwaitingReply] = useState(false);
  const inputBarRef = useRef<HTMLFormElement>(null);

  const openChat = useCallback(async () => {
    if (open) {
      return;
    }
    onOpen?.();
    setOpen(true);
    if (!conversation.conversationId) {
      await conversation.createConversation();
    }
  }, [open, onOpen, conversation]);

  const closeChat = useCallback(() => {
    if (!open) {
      return false;
    }
    onClose?.();
    setOpen(false);
    return true;
  }, [open, onClose]);

  const [inputData, setInputData] = useState({
    text: "",
    error: "",
  });
  const inputText = inputData.text;
  const inputTextError = inputData.error;
  const setInputText = useCallback(
    (text: string) => {
      const isValid = maxInputCharacters
        ? text.length <= maxInputCharacters
        : true;
      setInputData({
        text,
        error: isValid
          ? ""
          : `Input must be less than ${maxInputCharacters} characters`,
      });
    },
    [maxInputCharacters]
  );

  const canSubmit = useCallback(
    (text: string) => {
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
    },
    [conversation.conversationId, inputData.error, awaitingReply]
  );

  const handleSubmit = useCallback(
    async (text: string) => {
      if (!canSubmit(text)) return;
      try {
        setInputText("");
        setAwaitingReply(true);
        openChat();
        await conversation.addMessage({
          role: "user",
          content: text,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setAwaitingReply(false);
      }
    },
    [canSubmit, setInputText, setAwaitingReply, openChat, conversation]
  );

  return {
    awaitingReply,
    canSubmit,
    chatbotName,
    closeChat,
    conversation,
    handleSubmit,
    inputBarRef,
    inputText,
    inputTextError,
    isExperimental,
    maxInputCharacters,
    maxCommentCharacters,
    open,
    openChat,
    setInputText,
  };
}
