import { css } from "@emotion/css";
import Banner from "@leafygreen-ui/banner";
import LeafyGreenProvider, {
  useDarkMode,
} from "@leafygreen-ui/leafygreen-provider";
import Modal from "@leafygreen-ui/modal";
import { palette } from "@leafygreen-ui/palette";
import { Body, Link } from "@leafygreen-ui/typography";
import { DisclaimerText as LGDisclaimerText } from "@lg-chat/chat-disclaimer";
import { ChatWindow } from "@lg-chat/chat-window";
import { ChatTrigger } from "@lg-chat/fixed-chat-window";
import {
  InputBar as LGInputBar,
  InputBarProps as LGInputBarProps,
} from "@lg-chat/input-bar";
import { LeafyGreenChatProvider } from "@lg-chat/leafygreen-chat-provider";
import { Message } from "./Message";
import { MessageFeed } from "@lg-chat/message-feed";
import { useEffect, useState } from "react";
import { CharacterCount } from "./InputBar";
import { UserProvider } from "./UserProvider";
import { MessageData } from "./services/conversations";
import { Conversation, useConversation } from "./useConversation";
import { User } from "./useUser";

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
  chat_window: css`
    border-radius: 24px;
  `,
  chatbot_modal: css`
    z-index: 2;

    & * {
      box-sizing: border-box;
    }

    & div[role="dialog"] {
      padding: 0;
    }

    @media screen and (max-width: 1024px) {
      & div[role="dialog"] {
        width: 100%;
      }
    }
  `,
  disclaimer_text: css`
    text-align: center;
    margin-top: 16px;
    margin-bottom: 32px;
  `,
  chatbot_input: css`
    padding-bottom: 1rem;
    & > p {
      text-align: left;
    }
  `,
  chatbot_input_area: css`
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
    padding-left: 32px;
    padding-right: 32px;
    padding-top: 0.5rem;
    padding-bottom: 1rem;
  `,
  chatbot_input_error_border: css`
    > div {
      > div {
        border-color: ${palette.red.base} !important;
        border-width: 2px !important;
      }
    }
  `,
};

export type ChatbotProps = {
  darkMode?: boolean;
  serverBaseUrl?: string;
  shouldStream?: boolean;
  suggestedPrompts?: string[];
  startingMessage?: string;
  user?: User;
};

export function Chatbot(props: ChatbotProps) {
  const { darkMode, user, ...InnerChatbotProps } = props;
  // TODO: Use ConversationProvider
  return (
    <LeafyGreenProvider darkMode={props.darkMode}>
      <UserProvider user={user}>
        <InnerChatbot {...InnerChatbotProps} />
      </UserProvider>
    </LeafyGreenProvider>
  );
}

type InnerChatbotProps = {
  serverBaseUrl?: string;
  shouldStream?: boolean;
  suggestedPrompts?: string[];
  welcomeMessage?: string;
};

const WELCOME_MESSAGE =
  "Welcome to MongoDB AI Assistant. What can I help you with?";

const SUGGESTED_PROMPTS = [
  "How do you deploy a free cluster in Atlas?",
  "How do you import or migrate data into MongoDB Atlas?",
  "How do I get started with MongoDB?",
  "Why should I use Atlas Search?",
];

function InnerChatbot({
  serverBaseUrl,
  shouldStream,
  suggestedPrompts = SUGGESTED_PROMPTS,
  welcomeMessage = WELCOME_MESSAGE,
}: InnerChatbotProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [welcomeMessageData, setWelcomeMessageData] =
    useState<MessageData | null>(null);
  const [inputBarValue, setInputBarValue] = useState("");

  const conversation = useConversation({
    serverBaseUrl: serverBaseUrl,
    shouldStream: shouldStream,
  });

  useEffect(() => {
    if (!conversation.conversationId || welcomeMessageData) return;

    const newWelcomeMessageData = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: welcomeMessage,
      createdAt: new Date().toLocaleTimeString(),
    } satisfies MessageData;

    setWelcomeMessageData(newWelcomeMessageData);
  }, [conversation.conversationId, welcomeMessageData, welcomeMessage]);

  const openModal = async () => {
    if (modalOpen) return;

    if (!conversation.conversationId) {
      await conversation.createConversation();
    }

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <ChatTrigger
        className={styles.chat_trigger}
        onClick={async () => await openModal()}
      >
        MongoDB AI
      </ChatTrigger>
      <ChatbotModal
        open={modalOpen}
        shouldClose={() => {
          closeModal();
          return true;
        }}
        suggestedPrompts={suggestedPrompts}
        welcomeMessageData={welcomeMessageData}
        conversation={conversation}
        inputBarValue={inputBarValue}
        setInputBarValue={setInputBarValue}
      />
    </>
  );
}

type ChatbotModalProps = {
  open: boolean;
  shouldClose: () => boolean;
  suggestedPrompts?: string[];
  welcomeMessageData: MessageData | null;
  conversation: Conversation;
  inputBarValue: string;
  setInputBarValue: React.Dispatch<React.SetStateAction<string>>;
};

function ChatbotModal({
  open,
  shouldClose,
  suggestedPrompts,
  welcomeMessageData,
  conversation,
  inputBarValue,
  setInputBarValue,
}: ChatbotModalProps) {
  const messages = welcomeMessageData
    ? [welcomeMessageData, ...conversation.messages]
    : conversation.messages;
  const [awaitingReply, setAwaitingReply] = useState(false);
  const { darkMode } = useDarkMode();

  const handleSubmit = async (prompt: string) => {
    if (!conversation.conversationId) {
      console.error(`Cannot addMessage without a conversationId`);
      return;
    }

    if (awaitingReply) return;

    // Don't let users submit a message that is empty or only whitespace
    if (prompt.replace(/\s/g, "").length === 0) return;

    try {
      setInputBarValue("");
      setAwaitingReply(true);
      await conversation.addMessage("user", prompt);
    } catch (e) {
      console.error(e);
    } finally {
      setAwaitingReply(false);
    }
  };

  const isLoading = (messageId: string) => {
    return (
      conversation.isStreamingMessage &&
      messageId === conversation.streamingMessage?.id &&
      conversation.streamingMessage?.content === ""
    );
  };

  const promptIsTooLong = () => {
    return inputBarValue.length > MAX_INPUT_CHARACTERS;
  };

  return (
    <Modal
      open={open}
      size="large"
      shouldClose={shouldClose}
      className={styles.chatbot_modal}
    >
      <LeafyGreenChatProvider>
        <ChatWindow
          title="MongoDB AI Assistant"
          badgeText="Experimental"
          className={styles.chat_window}
        >
          <MessageFeed>
            <DisclaimerText />
            {messages.map((message, idx) => {
              return (
                <Message
                  key={message.id}
                  isLoading={isLoading(message.id)}
                  conversation={conversation}
                  messageData={message}
                  showRating={message.role === "assistant" && idx !== 0}
                  suggestedPrompts={suggestedPrompts}
                  showSuggestedPrompts={idx === 0 && conversation.messages.length === 0}
                  onSuggestedPromptClick={handleSubmit}
                />
              );
            })}
          </MessageFeed>
          <div className={styles.chatbot_input_area}>
            {conversation.error ? (
              <ErrorBanner darkMode={darkMode} message={conversation.error} />
            ) : (
              <InputBar
                inputBarValue={inputBarValue}
                onSubmit={() => handleSubmit(inputBarValue)}
                inputBarHasError={promptIsTooLong()}
                disabled={!!conversation.error}
                disableSend={awaitingReply || promptIsTooLong()}
                textareaProps={{
                  value: inputBarValue,
                  onChange: (e) => {
                    setInputBarValue(e.target.value);
                  },
                  placeholder: conversation.error
                    ? "Something went wrong. Try reloading the page and starting a new conversation."
                    : awaitingReply
                    ? "MongoDB AI Assistant is answering..."
                    : "Ask MongoDB AI Assistant a Question",
                }}
              />
            )}
          </div>
        </ChatWindow>
      </LeafyGreenChatProvider>
    </Modal>
  );
}

const MAX_INPUT_CHARACTERS = 300;
interface InputBarProps extends LGInputBarProps {
  inputBarValue: string;
  inputBarHasError: boolean;
}

const InputBar = (props: InputBarProps) => {
  const { inputBarValue, inputBarHasError, ...LGInputBarProps } = props;
  const { darkMode } = useDarkMode();

  return (
    <>
      <LGInputBar
        className={
          inputBarHasError ?? false
            ? styles.chatbot_input_error_border
            : undefined
        }
        shouldRenderGradient={!inputBarHasError}
        {...LGInputBarProps}
      />
      <div
        className={css`
          display: flex;
          justify-content: space-between;
        `}
      >
        <Body baseFontSize={13}>
          This is an experimental generative AI chatbot. All information should
          be verified prior to use.
        </Body>
        <CharacterCount
          darkMode={darkMode}
          current={inputBarValue.length}
          max={MAX_INPUT_CHARACTERS}
        />
      </div>
    </>
  );
};

type ErrorBannerProps = {
  message?: string;
  darkMode?: boolean;
};

function ErrorBanner({
  message = "Something went wrong.",
  darkMode = false,
}: ErrorBannerProps) {
  return (
    <Banner darkMode={darkMode} variant="danger">
      {message}
      <br />
      Reload the page to start a new conversation.
    </Banner>
  );
}

const DisclaimerText = () => {
  return (
    <LGDisclaimerText
      title="Terms and Policy"
      className={styles.disclaimer_text}
    >
      <Body>
        This is a generative AI Chatbot. By interacting with it, you agree to
        MongoDB's{" "}
        <Link
          hideExternalIcon
          href={"https://www.mongodb.com/legal/terms-of-use"}
        >
          Terms of Use
        </Link>{" "}
        and{" "}
        <Link
          hideExternalIcon
          href={"https://www.mongodb.com/legal/acceptable-use-policy"}
        >
          Acceptable Use Policy.
        </Link>
      </Body>
    </LGDisclaimerText>
  );
};
