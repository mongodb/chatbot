import { useState, useRef, useEffect } from "react";
import { InputMenu, MenuPrompt } from "./InputMenu";
import { useConversation, Conversation } from "./useConversation";
import Banner from "@leafygreen-ui/banner";
import Modal, { ModalProps } from "@leafygreen-ui/modal";
import { ParagraphSkeleton } from "@leafygreen-ui/skeleton-loader";
import {
  Body,
  Link,
  Error as ErrorText,
  InlineCode,
} from "@leafygreen-ui/typography";
import { LeafyGreenChatProvider } from "@lg-chat/leafygreen-chat-provider";
import { ChatWindow } from "@lg-chat/chat-window";
import { Avatar } from "@lg-chat/avatar";
import { InputBar } from "@lg-chat/input-bar";
import {
  Message,
  MessageContent as LGChatMessageContent,
  MessageContentProps,

} from "@lg-chat/message";
import { MessageFeed } from "@lg-chat/message-feed";
import { MessageRatingProps } from "@lg-chat/message-rating";
import { Role } from "./services/conversations";
import { palette } from "@leafygreen-ui/palette";
import { css } from "@emotion/css";
import { type StylesProps } from "./utils";
import LeafyGreenProvider, {
  useDarkModeContext,
} from "@leafygreen-ui/leafygreen-provider";

const styles = {
  disclosure: ({ darkMode }: StylesProps) => css`
    display: flex;
    flex-direction: row;
    gap: 8px;
    padding-left: 8px;

    & > p {
      color: ${darkMode ? palette.white : palette.black};
    }
  }`,
  chatbot_container: css`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    & * {
      box-sizing: border-box;
    }
  }`,
  chatbot_input: css`
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
  conversation_id_info: css`
    display: flex;
    flex-direction: row;
    justify-content: center;
  `,
  modal_container: ({ darkMode }: StylesProps) => css`
    z-index: 2;

    & * {
      box-sizing: border-box;
    }

    & div[role="dialog"] {
      padding: 0;
      background: ${darkMode ? palette.black : palette.gray.light3};
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
  chat_window: css`
    border-radius: 24px;
  `,
  message_feed: css`
    & > div {
      box-sizing: border-box;
    }
  `,
  message_content: css`
    width: 100%;
    background: red;
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
  chatbot_input_menu: css`
    z-index: 1;
  `,
  verify_information: css`
    text-align: center;
  `,
};

const MAX_INPUT_CHARACTERS = 300;

const suggestedPrompts = [
  { key: "deploy", text: "How do you deploy a free cluster in Atlas?" },
  {
    key: "import",
    text: "How do you import or migrate data into MongoDB Atlas?",
  },
  { key: "get-started", text: "Get started with MongoDB" },
  { key: "why-search", text: "Why should I use Atlas Search?" },
] satisfies MenuPrompt[];

function isSender(role: Role) {
  return role === "user";
}

function getAvatarVariantForRole(role: Role) {
  const avatarVariant = (
    {
      user: "user",
      assistant: "mongo",
    } as const
  )[role];
  return avatarVariant;
}

const MessageContent = (props: MessageContentProps) => (
  <LGChatMessageContent className={styles.message_content} {...props} />
);

export type ChatbotProps = {
  serverBaseUrl?: string;
  shouldStream?: boolean;
  darkMode?: boolean;
};

export function Chatbot(props: ChatbotProps) {
  const conversation = useConversation({
    serverBaseUrl: props.serverBaseUrl,
    shouldStream: props.shouldStream,
  });
  const { contextDarkMode = false } = useDarkModeContext();
  const darkMode = props.darkMode ?? contextDarkMode;
  const [initialInputFocused, setInitialInputFocused] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [awaitingReply, setAwaitingReply] = useState(false);
  const inputBarRef = useRef<HTMLFormElement>(null);

  async function openModal() {
    if (modalOpen) {
      return;
    }
    setModalOpen(true);
    if (!conversation.conversationId) {
      await conversation.createConversation();
    }
  }

  function closeModal() {
    setModalOpen(false);
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

  const handleSubmit = async (text: string) => {
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
      openModal();
      await conversation.addMessage("user", text);
    } catch (e) {
      console.error(e);
    } finally {
      setAwaitingReply(false);
    }
  };

  const showSuggestedPrompts =
    menuOpen &&
    inputText.length === 0 &&
    conversation.messages.length === 0 &&
    !awaitingReply;

  // We have to use some hacky interval logic to get around the weird
  // focus/blur event handling interactions between InputBar and InputMenu.
  const [promptFocused, setPromptFocused] = useState<number | null>(null);
  useEffect(() => {
    const interval = setInterval(() => {
      if (!initialInputFocused && promptFocused === null) {
        setMenuOpen(false);
        clearInterval(interval);
      }
      if (initialInputFocused && conversation.messages.length === 0) {
        setMenuOpen(true);
      }

      if (!conversation.conversationId) {
        conversation.createConversation();
      }
    }, 100);
    return () => clearInterval(interval);
  }, [initialInputFocused, promptFocused, conversation]);

  return (
    <LeafyGreenProvider darkMode={darkMode}>
      <div className={styles.chatbot_container}>
        <div className={styles.chatbot_input}>
          <InputBar
            key={"initialInput"}
            badgeText="Experimental"
            textareaProps={{
              value: !modalOpen ? inputText : "",
              onChange: (e) => {
                if (!modalOpen) setInputText(e.target.value);
              },
              placeholder: conversation.error
                ? "Something went wrong. Try reloading the page and starting a new conversation."
                : awaitingReply
                ? "MongoDB AI is answering..."
                : "Ask MongoDB AI a Question",
            }}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                inputText.length === 0 &&
                conversation.messages.length > 0
              ) {
                openModal();
              }
            }}
            onMessageSend={async (messageContent) => {
              if (!modalOpen && conversation.messages.length > 0) {
                openModal();
                return;
              }
              const canSubmit =
                inputTextError.length === 0 && !conversation.error;
              if (canSubmit) {
                await handleSubmit(messageContent);
              }
            }}
            onClick={async () => {
              setInitialInputFocused(true);
              if (conversation.messages.length > 0) {
                openModal();
              } else {
                setMenuOpen(true);
              }
              if (!conversation.conversationId) {
                await conversation.createConversation();
              }
            }}
            onFocus={async () => {
              setInitialInputFocused(true);
            }}
            onBlur={() => {
              setInitialInputFocused(false);
            }}
          />

          {inputTextError ? <ErrorText>{inputTextError}</ErrorText> : null}

          {showSuggestedPrompts ? (
            <InputMenu
              className={styles.chatbot_input_menu}
              darkMode={darkMode}
              heading="SUGGESTED AI PROMPTS"
              headingBadgeText=""
              poweredByText="Powered by Atlas Vector Search"
              poweredByCTA="Learn More"
              poweredByLink="https://www.mongodb.com/products/platform/atlas-vector-search"
              prompts={suggestedPrompts}
              onFocused={(i) => {
                setPromptFocused(i);
              }}
              onBlurred={(i) => {
                if (i === 0 || i === suggestedPrompts.length) {
                  setPromptFocused(null);
                }
              }}
              onPromptSelected={({ text }) => {
                handleSubmit(text);
              }}
            />
          ) : null}

          <Disclosure tabIndex={0} darkMode={darkMode} />
        </div>
        <ChatbotModal
          inputBarRef={inputBarRef}
          active={modalOpen}
          conversation={conversation}
          inputText={inputText}
          setInputText={setInputText}
          inputTextError={inputTextError}
          handleSubmit={handleSubmit}
          awaitingReply={awaitingReply}
          open={modalOpen}
          shouldClose={() => {
            setMenuOpen(false);
            closeModal();
            return true;
          }}
          darkMode={darkMode}
        />
      </div>
    </LeafyGreenProvider>
  );
}

function LoadingSkeleton() {
  return <ParagraphSkeleton className={styles.loading_skeleton} />;
}

type ChatbotModalProps = {
  inputBarRef: React.RefObject<HTMLFormElement>;
  active: boolean;
  conversation: Conversation;
  inputText: string;
  setInputText: (text: string) => void;
  inputTextError: string;
  handleSubmit: (text: string) => Promise<void>;
  awaitingReply: boolean;
  open: boolean;
  shouldClose: ModalProps["shouldClose"];
  darkMode?: boolean;
};

function ChatbotModal({
  open,
  shouldClose,
  inputBarRef,
  active,
  conversation,
  inputText,
  setInputText,
  inputTextError,
  handleSubmit,
  awaitingReply,
  darkMode,
}: ChatbotModalProps) {
  const isEmptyConversation = conversation.messages.length === 0;

  // TODO - Work with LG Chat to make InputBar focusable.
  //
  // Focus the input bar when the modal opens. This lets the user start
  // typing another message while the previous message is still being
  // processed.
  // const focusInputBar = useCallback(() => {
  //   const textarea = inputBarRef.current?.getElementsByTagName("textarea")[0];
  //   if (textarea) {
  //     textarea.focus();
  //   }
  // }, [inputBarRef]);

  // useEffect(() => {
  //   if (open) {
  //     focusInputBar();
  //   }
  // }, [open, focusInputBar]);

  const ActiveInputBarId = "active-input-bar";

  return (
    <Modal
      className={styles.modal_container({ darkMode })}
      open={open}
      size="large"
      initialFocus={`#${ActiveInputBarId}`}
      shouldClose={shouldClose}
    >
      <LeafyGreenChatProvider>
        <ChatWindow
          className={styles.chat_window}
          badgeText="Experimental"
          title="MongoDB AI"
          darkMode={darkMode}
        >
          {!isEmptyConversation ? (
            <MessageFeed darkMode={darkMode} className={styles.message_feed}>
              {conversation.messages.map((message) => {
                const showLoadingSkeleton = conversation.isStreamingMessage
                  ? message.id === conversation.streamingMessage?.id &&
                    conversation.streamingMessage?.content === ""
                  : false;
                return (
                  <Message
                    darkMode={darkMode}
                    baseFontSize={13}
                    key={message.id}
                    isSender={isSender(message.role)}
                    componentOverrides={{ MessageContent }}
                    messageRatingProps={
                      message.role === "assistant"
                        ? {
                            description: "Was this response helpful?",
                            onChange: (e) => {
                              const value = e.target
                                .value as MessageRatingProps["value"];
                              if (!value) {
                                return;
                              }
                              conversation.rateMessage(
                                message.id,
                                value === "liked" ? true : false
                              );
                            },
                            value:
                              message.rating === undefined
                                ? undefined
                                : message.rating
                                ? "liked"
                                : "disliked",
                          }
                        : undefined
                    }
                    avatar={
                      <Avatar
                        darkMode={darkMode}
                        variant={getAvatarVariantForRole(message.role)}
                      />
                    }
                    sourceType={showLoadingSkeleton ? undefined : "markdown"}
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
                            <Body
                              className={styles.markdown_ul}
                              as="ul"
                              {...props}
                            >
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
                    {showLoadingSkeleton && message.role === "assistant"
                      ? ((<LoadingSkeleton />) as unknown as string)
                      : message.content}
                  </Message>
                );
              })}
            </MessageFeed>
          ) : null}
          <div className={styles.chatbot_input}>
            {conversation.error ? (
              <ErrorBanner darkMode={darkMode} message={conversation.error} />
            ) : null}

            {!conversation.error ? (
              <>
                <InputBar
                  darkMode={darkMode}
                  ref={inputBarRef}
                  disabled={active && Boolean(conversation.error?.length)}
                  disableSend={awaitingReply}
                  onMessageSend={(messageContent) => {
                    const canSubmit =
                      inputTextError.length === 0 && !conversation.error;
                    if (canSubmit) {
                      handleSubmit(messageContent);
                    }
                  }}
                  textareaProps={{
                    id: ActiveInputBarId,
                    value: inputText,
                    onChange: (e) => {
                      setInputText(e.target.value);
                    },
                    placeholder: conversation.error
                      ? "Something went wrong. Try reloading the page and starting a new conversation."
                      : awaitingReply
                      ? "MongoDB AI is answering..."
                      : "Ask MongoDB AI a Question",
                  }}
                />
                {inputTextError ? (
                  <ErrorText>{inputTextError}</ErrorText>
                ) : null}
              </>
            ) : null}

            <Body className={styles.verify_information}>
              This is an experimental generative AI chatbot. All information
              should be verified prior to use.
            </Body>

            <ConversationIdInfo conversation={conversation} />
          </div>
        </ChatWindow>
      </LeafyGreenChatProvider>
    </Modal>
  );
}

interface DisclosureProps extends React.HTMLAttributes<HTMLDivElement> {
  darkMode?: boolean;
}

function Disclosure({ darkMode, ...props }: DisclosureProps) {
  const TermsOfUse = () => (
    <Link href={"https://www.mongodb.com/legal/terms-of-use"}>
      Terms of Use
    </Link>
  );
  const AcceptableUsePolicy = () => (
    <Link href={"https://www.mongodb.com/legal/acceptable-use-policy"}>
      Acceptable Use Policy
    </Link>
  );

  return (
    <div className={styles.disclosure({ darkMode })} {...props}>
      <Body color={"#FFFFFF"}>
        This is a generative AI chatbot. By interacting with it, you agree to
        MongoDB's <TermsOfUse /> and <AcceptableUsePolicy />.
      </Body>
    </div>
  );
}

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

function ConversationIdInfo({ conversation }: { conversation: Conversation }) {
  return import.meta.env.VITE_QA === "true" ? (
    <div className={styles.conversation_id_info}>
      <Body>
        Conversation ID: <InlineCode>{conversation.conversationId}</InlineCode>
      </Body>
    </div>
  ) : null;
}
