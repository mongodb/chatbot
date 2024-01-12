import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";
import { ChatTrigger } from "@lg-chat/fixed-chat-window";
import { ChatbotTriggerProps } from "./ChatbotTrigger";
import { useChatbotContext } from "./useChatbotContext";
import classNames from "classnames";

export type ActionButtonTriggerProps = ChatbotTriggerProps & {
  text?: string;
};

export function ActionButtonTrigger(props: ActionButtonTriggerProps) {
  const { darkMode } = useDarkMode(props.darkMode);
  const { chatbotName, openChat } = useChatbotContext();
  const { className, text } = props;

  const buttonText = text ?? `Ask ${chatbotName ?? "the Chatbot"}`;

  return (
    <ChatTrigger
      className={classNames(className)}
      darkMode={darkMode}
      onClick={openChat}
    >
      {buttonText}
    </ChatTrigger>
  );
}
