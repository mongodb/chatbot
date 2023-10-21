import { css } from "@emotion/css";
import { ChatTrigger } from "@lg-chat/fixed-chat-window";
import { type ChatbotTriggerProps } from "./ChatbotTrigger";

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

export type FloatingActionButtonTriggerProps = ChatbotTriggerProps;

export function FloatingActionButtonTrigger(props: FloatingActionButtonTriggerProps) {
  return (
    <ChatTrigger
      className={styles.chat_trigger}
      onClick={async () => {
        await props.openChat();
      }}
    >
      MongoDB AI
    </ChatTrigger>
  );
}
