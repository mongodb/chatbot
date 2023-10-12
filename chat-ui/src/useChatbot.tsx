import { css } from "@emotion/css";
import LeafyGreenProvider, {
  useDarkMode,
} from "@leafygreen-ui/leafygreen-provider";
import { palette } from "@leafygreen-ui/palette";
import { Body, Error as ErrorText, Link } from "@leafygreen-ui/typography";
import { useRef, useState } from "react";
import { InputBar, SuggestedPrompt, SuggestedPrompts } from "./InputBar";
import { MAX_INPUT_CHARACTERS } from "./constants";
import { useConversation } from "./useConversation";
import { addQueryParams } from "./utils";
import { ChatbotModal } from "./ChatbotModal";
import { LinkDataProvider, useLinkData } from "./useLinkData";

export type UseChatbotProps = {
  serverBaseUrl?: string;
  shouldStream?: boolean;
  suggestedPrompts?: string[];
};

export function useChatbot(props: UseChatbotProps) {
  const conversation = useConversation({
    serverBaseUrl: props.serverBaseUrl,
    shouldStream: props.shouldStream,
  });
  const [open, setOpen] = useState(false);
  const [awaitingReply, setAwaitingReply] = useState(false);
  const inputBarRef = useRef<HTMLFormElement>(null);

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
  }

  const [inputData, setInputData] = useState({
    text: "",
    error: "",
  });
  const inputText = inputData.text;
  const inputTextError = inputData.error;
  function setInputText(text: string) {
    const isValid = text.length <= MAX_INPUT_CHARACTERS;
    setInputData({
      text,
      error: isValid
        ? ""
        : `Input must be less than ${MAX_INPUT_CHARACTERS} characters`,
    });
  }

  async function handleSubmit(text: string) {
    if (!conversation.conversationId) {
      console.error(`Cannot addMessage without a conversationId`);
      return;
    }
    if (inputData.error) {
      console.error(`Cannot addMessage with invalid input text`);
      return;
    }
    // Don't let users submit a message that is empty or only whitespace
    if (text.replace(/\s/g, "").length === 0) return;
    // Don't let users submit a message if we're already waiting for a reply
    if (awaitingReply) return;
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
  };

  return {
    awaitingReply,
    closeChat,
    conversation,
    handleSubmit,
    inputBarRef,
    inputText,
    inputTextError,
    open,
    openChat,
    setInputText,
  };
}
