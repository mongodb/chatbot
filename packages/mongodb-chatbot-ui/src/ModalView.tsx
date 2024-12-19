import { css, cx } from "@emotion/css";
import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";
import Modal, { ModalProps } from "@leafygreen-ui/modal";
import { palette } from "@leafygreen-ui/palette";
import { Suspense, lazy } from "react";
import { type StylesProps } from "./utils";
import { type ChatbotViewProps } from "./ChatbotView";
import { useChatbotContext } from "./useChatbotContext";

const styles = {
  modal_container: ({ darkMode }: StylesProps) => css`
    z-index: 100;

    & * {
      box-sizing: border-box;
    }

    > div {
      padding: unset;
    }

    & div[role="dialog"] {
      padding: 0;
      background: ${darkMode ? palette.black : palette.gray.light3};

      > button {
        top: 14px;
      }
    }

    @media screen and (max-width: 1024px) {
      & div[role="dialog"] {
        width: 100%;
      }

      & > div {
        padding: 32px 18px;
      }
    }
  `,
};

const ChatWindow = lazy(() =>
  import("./ChatWindow").then((module) => ({ default: module.ChatWindow }))
);

export type ModalViewProps = ChatbotViewProps & {
  shouldClose?: ModalProps["shouldClose"];
};

export function ModalView(props: ModalViewProps) {
  const { darkMode } = useDarkMode(props.darkMode);
  const { className, inputBarId, ...chatWindowProps } = props;

  const { closeChat, open, conversation } = useChatbotContext();

  const shouldClose = () => {
    if (props.shouldClose?.() ?? true) {
      closeChat();
      return true;
    } else {
      return false;
    }
  };

  const chatWindowInputBarId = inputBarId ?? "chatbot-modal-input-bar";

  console.log("chatWindowInputBarId", chatWindowInputBarId);

  return (
    <Suspense fallback={null}>
      {open ? (
        <Modal
          className={cx(styles.modal_container({ darkMode }), className)}
          open={open}
          size="large"
          initialFocus={
            !conversation.error ? `#${chatWindowInputBarId}` : undefined
          }
          shouldClose={shouldClose}
        >
          <ChatWindow inputBarId={chatWindowInputBarId} {...chatWindowProps} />
        </Modal>
      ) : null}
    </Suspense>
  );
}
