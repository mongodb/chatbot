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
import { Avatar } from "@lg-chat/avatar";
import { InputBar } from "@lg-chat/input-bar";
import { Message } from "@lg-chat/message";
import { MessageFeed } from "@lg-chat/message-feed";
import { MessageRating, MessageRatingProps } from "@lg-chat/message-rating";
import { TitleBar } from "@lg-chat/title-bar";
import { Role } from "./services/conversations";
import { palette } from "@leafygreen-ui/palette";
import { css } from "@emotion/css";

const styles = {
  disclosure: css`
    display: flex;
    flex-direction: row;
    gap: 8px;
    padding-left: 8px;

    & > p {
      color: white;
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
  `,
  conversation_id_info: css`
    display: flex;
    flex-direction: row;
    justify-content: center;
  `,
  title_bar: css`
    box-sizing: border-box;
    margin-bottom: -1rem; /* This is to offset the .card gap */

    width: calc(100% + 64px);
    margin-left: -32px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  `,
  modal_container: css`
    z-index: 2;

    & * {
      box-sizing: border-box;
    }

    & div[role="dialog"] {
      padding-top: 8px;
      background: ${palette.gray.light3};
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
  message_feed: css`
    width: calc(100% + 64px);
    margin-left: -32px;
    margin-bottom: -1rem; /* This is to offset the .chat_input margin-top */

    & > div {
      box-sizing: border-box;
      min-height: 20rem;
      max-height: 60vh;
    }

    @media screen and (max-width: 1024px) {
      & > div {
        max-height: 70vh;
      }
    }
    @media screen and (max-width: 767px) {
      & > div {
        height: 65vh;
      }
    }
  `,
  // This is a hacky fix for weird white-space issues in LG Chat.
  markdown_container: css`
    & li {
      white-space: normal;
      margin-top: -1rem;
    }
  `,
  // End hacky fix
  message_rating: css`
    margin-top: 1rem;
  `,
  loading_skeleton: css`
    margin-bottom: 16px;
  `,
  card: css`
    display: flex;
    flex-direction: column;
    align-items: start;
    width: 100%;
    gap: 1rem;
    padding-top: 1rem;
    transition: all 0.25s ease;
    position: relative;
    padding: 0;
    border-top-left-radius: 6px;
    box-shadow: none;
    background: transparent;
    box-sizing: border-box;
  `,
  chatbot_input_menu: css`
    z-index: 1;
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

export function Chatbot() {
  const conversation = useConversation();
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
    }, 100);
    return () => clearInterval(interval);
  }, [initialInputFocused, promptFocused]);

  return (
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
          onMessageSend={async (messageContent) => {
            const canSubmit =
              inputTextError.length === 0 && !conversation.error;
            if (canSubmit) {
              await handleSubmit(messageContent);
            }
          }}
          onFocus={async () => {
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
          onBlur={() => {
            setInitialInputFocused(false);
          }}
        />

        {inputTextError ? <ErrorText>{inputTextError}</ErrorText> : null}

        {showSuggestedPrompts ? (
          <InputMenu
            className={styles.chatbot_input_menu}
            heading="SUGGESTED AI PROMPTS"
            headingBadgeText="Experimental"
            poweredByText="Powered by Atlas Vector Search"
            poweredByCTA="Learn More"
            poweredByLink="https://www.mongodb.com/products/platform/atlas-vector-search"
            prompts={suggestedPrompts}
            onPromptFocused={(i) => {
              setPromptFocused(i);
            }}
            onPromptBlur={(i) => {
              if (i === suggestedPrompts.length - 1) {
                setPromptFocused(null);
              }
            }}
            onPromptSelected={({ text }) => {
              handleSubmit(text);
            }}
          />
        ) : null}

        <Disclosure tabIndex={0} />

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
      />
    </div>
  );
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
      className={styles.modal_container}
      open={open}
      size="large"
      initialFocus={`#${ActiveInputBarId}`}
      shouldClose={shouldClose}
    >
      <div className={styles.card}>
        <TitleBar
          className={styles.title_bar}
          badgeText="Experimental"
          title="MongoDB AI"
        />

        {!isEmptyConversation ? (
          <MessageFeed className={styles.message_feed}>
            {conversation.messages.map((message) => {
              const showLoadingSkeleton = conversation.isStreamingMessage
                ? message.id === conversation.streamingMessage?.id &&
                  conversation.streamingMessage?.content === ""
                : false;
              return (
                <Message
                  key={message.id}
                  isSender={isSender(message.role)}
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
                    <Avatar variant={getAvatarVariantForRole(message.role)} />
                  }
                  sourceType={showLoadingSkeleton ? undefined : "markdown"}
                  componentOverrides={{
                    MessageRating: (props: MessageRatingProps) => (
                      <MessageRating
                        {...props}
                        className={styles.message_rating}
                      />
                    ),
                    ...(showLoadingSkeleton
                      ? {
                          MessageContent: () => (
                            <ParagraphSkeleton
                              className={styles.loading_skeleton}
                            />
                          ),
                        }
                      : {}),
                  }}
                  markdownProps={{
                    className: styles.markdown_container,
                    children: showLoadingSkeleton ? "" : message.content, // TODO - remove when lg-chat omits this prop from the TS type
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
                          <Body as="ul" {...props}>
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
                  {showLoadingSkeleton ? "" : message.content}
                </Message>
              );
            })}
          </MessageFeed>
        ) : null}
        <div className={styles.chatbot_input}>
          {conversation.error ? (
            <ErrorBanner message={conversation.error} />
          ) : null}

          <VerifyInformationBanner />

          {!conversation.error ? (
            <InputBar
              ref={inputBarRef}
              disabled={active && Boolean(conversation.error?.length)}
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
          ) : null}

          {inputTextError ? <ErrorText>{inputTextError}</ErrorText> : null}

          <ConversationIdInfo conversation={conversation} />
        </div>
      </div>
    </Modal>
  );
}

function Disclosure(props: React.HTMLAttributes<HTMLDivElement>) {
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
    <div className={styles.disclosure} {...props}>
      <Body color={"#FFFFFF"}>
        This is a generative AI chatbot. By interacting with it, you agree to
        MongoDB's <TermsOfUse /> and <AcceptableUsePolicy />.
      </Body>
    </div>
  );
}

function ErrorBanner({
  message = "Something went wrong.",
}: {
  message?: string;
}) {
  return (
    <Banner variant="danger">
      {message}
      <br />
      Reload the page to start a new conversation.
    </Banner>
  );
}

function VerifyInformationBanner() {
  return (
    <Banner variant="warning">
      This is an experimental generative AI chatbot. All information should be
      verified prior to use.
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
