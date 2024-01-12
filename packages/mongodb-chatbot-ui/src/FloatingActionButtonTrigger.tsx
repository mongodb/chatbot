import { css } from "@emotion/css";
import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";
import { ChatTrigger } from "@lg-chat/fixed-chat-window";
import { ChatbotTriggerProps } from "./ChatbotTrigger";
import { useChatbotContext } from "./useChatbotContext";
import classNames from "classnames";

const styles = {
  chat_trigger: css`
    position: fixed;
    bottom: 24px;
    right: 24px;

    @media screen and (min-width: 768px) {
      bottom: 32px;
      right: 24px;
    }
    @media screen and (min-width: 1024px) {
      bottom: 32px;
      right: 49px;
    }
  `,
};

export type FloatingActionButtonTriggerProps = ChatbotTriggerProps & {
  text?: string;
};

export function FloatingActionButtonTrigger(
  props: FloatingActionButtonTriggerProps
) {
  const { darkMode } = useDarkMode(props.darkMode);
  const { chatbotName, openChat } = useChatbotContext();
  const { className, text } = props;

  const buttonText = text ?? `Ask ${chatbotName ?? "the Chatbot"}`;

  return (
    <ChatTrigger
      className={classNames(styles.chat_trigger, className)}
      darkMode={darkMode}
      onClick={openChat}
    >
      {buttonText}
    </ChatTrigger>
  );
}
