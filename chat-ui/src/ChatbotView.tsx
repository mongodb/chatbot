import { ModalProps } from "@leafygreen-ui/modal";
import { Conversation } from "./useConversation";

export type ChatbotViewProps = {
  darkMode?: boolean;
  awaitingReply: boolean;
  conversation: Conversation;
  handleSubmit: (text: string) => void | Promise<void>;
  inputBarRef: React.RefObject<HTMLFormElement>;
  inputText: string;
  inputTextError: string;
  open: boolean;
  setInputText: (text: string) => void;
  shouldClose: ModalProps["shouldClose"];
  showDisclaimer?: boolean;
  initialMessageText?: string;
  initialMessageSuggestedPrompts?: string[];
};
