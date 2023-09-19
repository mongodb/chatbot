import { css } from "@emotion/css";
import LeafyGreenProvider from "@leafygreen-ui/leafygreen-provider";
import Modal from "@leafygreen-ui/modal";
import { ParagraphSkeleton } from "@leafygreen-ui/skeleton-loader";
import { Body, Link } from "@leafygreen-ui/typography";
import { Avatar } from "@lg-chat/avatar";
import { ChatWindow } from "@lg-chat/chat-window";
import { ChatTrigger } from "@lg-chat/fixed-chat-window";
import { InputBar } from "@lg-chat/input-bar";
import { LeafyGreenChatProvider } from "@lg-chat/leafygreen-chat-provider";
import { Message as LGMessage, MessageSourceType } from "@lg-chat/message";
import { MessageFeed } from "@lg-chat/message-feed";
import { MessagePrompt, MessagePrompts } from "@lg-chat/message-prompts";
import { Fragment, useEffect, useState } from "react";
import { MessageData } from "./services/conversations";
import { Conversation, useConversation } from "./useConversation";
// import { DisclaimerText } from "@lg-chat/chat-disclaimer";

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
  message_prompts: css`
    margin-left: 70px;
    @media screen and (max-width: 804px) {
      margin-left: 50px;
    }
  `,
  message_rating: css`
    margin-top: 1rem;
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
  disclaimer_text_container: css`
    display: flex;
  `,
  disclaimer_text: css`
    & p {
      text-align: center;
    }
  `,
  chatbot_input: css`
    padding-bottom: 1rem;
    & > p {
      text-align: left;
    }
  `,
  // This is a hacky fix for weird white-space issues in LG Chat.
  markdown_container: css`
    display: flex;
    flex-direction: column;

    & * {
      line-height: 28px;
    }

    & li {
      white-space: normal;
      margin-top: -1.5rem;
    }
  `,
  // End hacky fix
  markdown_ul: css`
    overflow-wrap: anywhere;
  `,
  loading_skeleton: css`
    margin-bottom: 16px;
    width: 100%;

    & > div {
      width: 100%;
    }
  `,
  fade_out: css`
    transition: 'opacity 300ms ease-in',
    opacity: 1,  
  `,
};

export type ChatbotProps = {
  darkMode?: boolean;
  serverBaseUrl?: string;
  shouldStream?: boolean;
  suggestedPrompts?: string[];
  startingMessage?: string;
};

export function Chatbot(props: ChatbotProps) {
  const { darkMode, ...InnerChatbotProps } = props;
  // TODO: Use ConversationProvider
  return (
    <LeafyGreenProvider darkMode={props.darkMode}>
      <InnerChatbot {...InnerChatbotProps} />
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

export function InnerChatbot({
  serverBaseUrl,
  shouldStream,
  suggestedPrompts,
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

    // TODO: Update the backend to accept a welcome message
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
      // TODO: Update the backend to accept a welcome message
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

// const DisclaimerTextDescription = () => {
//   return (
//     <div className={styles.disclaimer_text}>
//       This is a
//       <Link href={"https://www.mongodb.com/legal/terms-of-use"}>
//         Terms of Use
//       </Link>
//     </div>
//   );
// };

const SUGGESTED_PROMPTS = [
  "How do you deploy a free cluster in Atlas?",
  "How do you import or migrate data into MongoDB Atlas?",
  "How do I get started with MongoDB?",
  "Why should I use Atlas Search?",
];

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
  suggestedPrompts = SUGGESTED_PROMPTS,
  welcomeMessageData,
  conversation,
  inputBarValue,
  setInputBarValue,
}: ChatbotModalProps) {
  const messages = welcomeMessageData
    ? [welcomeMessageData, ...conversation.messages]
    : conversation.messages;
  const [awaitingReply, setAwaitingReply] = useState(false);

  const displaySuggestedPrompts = () => {
    return conversation.messages.length === 0;
  };

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
            {/* <DisclaimerText
              className={styles.disclaimer_text_container}
              title="Terms of Use"
            >
              {DisclaimerTextDescription()}
            </DisclaimerText> */}
            {messages.map((messageData, idx) => {
              return (
                <Message
                  key={messageData.id}
                  messageData={messageData}
                  suggestedPrompts={suggestedPrompts}
                  displaySuggestedPrompts={
                    idx === 0 && displaySuggestedPrompts()
                  }
                  suggestedPromptOnClick={handleSubmit}
                  isLoading={isLoading(messageData.id)}
                />
              );
            })}
          </MessageFeed>
          <InputBar
            onSubmit={() => handleSubmit(inputBarValue)}
            disabled={!!conversation.error}
            disableSend={awaitingReply}
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
        </ChatWindow>
      </LeafyGreenChatProvider>
    </Modal>
  );
}

type MessageProp = {
  messageData: MessageData;
  suggestedPrompts?: string[];
  displaySuggestedPrompts: boolean;
  suggestedPromptOnClick: (prompt: string) => void;
  isLoading: boolean;
};

const Message = ({
  messageData,
  suggestedPrompts = [],
  displaySuggestedPrompts,
  suggestedPromptOnClick,
  isLoading,
}: MessageProp) => {
  const [suggestedPromptIdx, setSuggestedPromptIdx] = useState(-1);

  return (
    <Fragment key={messageData.id}>
      <LGMessage
        baseFontSize={13}
        isSender={messageData.role === "user"}
        messageRatingProps={
          messageData.role === "assistant"
            ? {
                className: styles.message_rating,
                description: "How was the response?",
                onChange: (e) => console.log(e),
              }
            : undefined
        }
        avatar={
          <Avatar variant={messageData.role === "user" ? "user" : "mongo"} />
        }
        sourceType={isLoading ? undefined : MessageSourceType.Markdown}
        markdownProps={{
          className: styles.markdown_container,
          components: {
            a: ({ children, href }) => {
              return (
                <Link hideExternalIcon href={href}>
                  {children}
                </Link>
              );
            },
            p: ({ children, ...props }) => {
              return <Body {...props}>{children}</Body>;
            },
            ol: ({ children, ordered, ...props }) => {
              return (
                <Body as="ol" {...props}>
                  {children}
                </Body>
              );
            },
            ul: ({ children, ordered, ...props }) => {
              return (
                <Body className={styles.markdown_ul} as="ul" {...props}>
                  {children}
                </Body>
              );
            },
            li: ({ children, ordered, node, ...props }) => {
              return (
                <Body as="li" {...props}>
                  {children}
                </Body>
              );
            },
          },
        }}
      >
        {isLoading
          ? ((<LoadingSkeleton />) as unknown as string)
          : messageData.content}
      </LGMessage>
      {displaySuggestedPrompts && (
        <div className={styles.message_prompts}>
          <MessagePrompts label="Suggested Prompts">
            {suggestedPrompts.map((sp, idx) => (
              <MessagePrompt
                key={idx}
                onClick={() => {
                  setSuggestedPromptIdx(idx);
                  setTimeout(() => {
                    suggestedPromptOnClick(suggestedPrompts[idx]);
                  }, 300);
                }}
                selected={idx === suggestedPromptIdx}
              >
                {sp}
              </MessagePrompt>
            ))}
          </MessagePrompts>
        </div>
      )}
    </Fragment>
  );
};

const LoadingSkeleton = () => {
  return <ParagraphSkeleton className={styles.loading_skeleton} />;
};
