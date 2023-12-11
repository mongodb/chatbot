import { css } from "@emotion/css";
import { DarkModeProps } from "./DarkMode";
import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";
import { ChatTrigger } from "@lg-chat/fixed-chat-window";
import { useChatbotContext } from "./useChatbotContext";

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

export type FloatingActionButtonTriggerProps = DarkModeProps & {
  text?: string;
};

export function FloatingActionButtonTrigger(
  props: FloatingActionButtonTriggerProps
) {
  const { darkMode } = useDarkMode(props.darkMode);
  const { openChat } = useChatbotContext();
  const text = props.text ?? "MongoDB AI";

  return (
    <ChatTrigger
      className={styles.chat_trigger}
      darkMode={darkMode}
      onClick={openChat}
    >
      {text}
    </ChatTrigger>
  );
}
