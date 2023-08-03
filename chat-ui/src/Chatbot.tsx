import styles from "./Chatbot.module.css";
import { useState, useRef } from "react";
import SuggestedPrompts, { SuggestedPrompt } from "./SuggestedPrompts";
import useConversation, { Conversation } from "./useConversation";
import Badge from "@leafygreen-ui/badge";
import Banner from "@leafygreen-ui/banner";
import Modal, { ModalProps } from "@leafygreen-ui/modal";
import { ParagraphSkeleton } from "@leafygreen-ui/skeleton-loader";
import { Body, Link, Error as ErrorText, InlineCode } from "@leafygreen-ui/typography";
import { Avatar } from "@lg-chat/avatar";
import { InputBar } from "@lg-chat/input-bar";
import { Message } from "@lg-chat/message";
import { MessageFeed } from "@lg-chat/message-feed";
import { MessageRating, MessageRatingProps } from "@lg-chat/message-rating";
import { TitleBar } from "@lg-chat/title-bar";
import { Role } from "./services/conversations";

const MAX_INPUT_CHARACTERS = 300;

const suggestedPrompts = [
  { key: "deploy", text: "How do you deploy a free cluster in Atlas?" },
  {
    key: "import",
    text: "How do you import or migrate data into MongoDB Atlas?",
  },
  { key: "get-started", text: "Get started with MongoDB" },
  { key: "why-search", text: "Why should I use Atlas Search?" },
] satisfies SuggestedPrompt[];

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

export default function Chatbot() {
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

  const showDisclosure =
    !initialInputFocused ||
    (initialInputFocused && conversation.messages.length > 0);

  const showSuggestedPrompts =
    initialInputFocused &&
    !awaitingReply &&
    conversation.messages.length === 0 &&
    inputText.length === 0;

  return (
    <div className={styles.chatbot_container}>
      <div className={styles.chatbot_input}>
        <InputBar
          key={"initialInput"}
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
          onMessageSend={(messageContent) => {
            const canSubmit =
              inputTextError.length === 0 && !conversation.error;
            if (canSubmit) {
              handleSubmit(messageContent);
              if (!modalOpen) openModal();
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
            setMenuOpen(false);
          }}
        />
        {menuOpen ? (
          <SuggestedPrompts
            prompts={showSuggestedPrompts ? suggestedPrompts : []}
            onPromptSelected={async (text) => {
              await handleSubmit(text);
              openModal();
            }}
          />
        ) : null}

        {showDisclosure ? <Disclosure /> : null}
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

        {active && !isEmptyConversation ? (
          <MessageFeed className={styles.message_feed}>
            {conversation.messages.map((message) => {
              const showLoadingSkeleton = conversation.isStreamingMessage
                ? message.id === conversation.streamingMessage?.id &&
                  conversation.streamingMessage?.content === ""
                : awaitingReply;
              return (
                <Message
                  key={message.id}
                  className={styles.message}
                  isSender={isSender(message.role)}
                  messageRatingProps={
                    message.role === "assistant"
                      ? {
                          description: "Rate this response:",
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
                    linkTarget: "_blank",
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
          {conversation.error ? <ErrorBanner /> : null}

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

function Disclosure() {
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
    <div className={styles.disclosure}>
      <Badge variant="blue">Experimental</Badge>
      <Body color={"#FFFFFF"}>
        This is a generative AI chatbot. By interacting with it, you agree to
        MongoDB's <TermsOfUse /> and <AcceptableUsePolicy />.
      </Body>
    </div>
  );
}

function ErrorBanner() {
  return (
    <Banner variant="danger">
      Something went wrong. Try reloading the page and starting a new
      conversation.
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
  return import.meta.env.VITE_QA ? (
    <div className={styles.conversation_id_info}>
      <Body>
        Conversation ID:{" "}<InlineCode>{conversation.conversationId}</InlineCode>
      </Body>
    </div>
  ) : null;
}
