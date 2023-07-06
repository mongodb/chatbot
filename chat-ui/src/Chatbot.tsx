import styles from "./Chatbot.module.css";
import { useState, useRef } from "react";
import Badge from "@leafygreen-ui/badge";
import Banner from "@leafygreen-ui/banner";
// import Card from "@leafygreen-ui/card";
import Box from "@leafygreen-ui/box";
import { Subtitle, Body, Link } from "@leafygreen-ui/typography";
import useConversation, { Conversation } from "./useConversation";
import { CSSTransition } from "react-transition-group";
import { useClickAway } from "@uidotdev/usehooks";
import ChatInput from "./ChatInput";
import SuggestedPrompts from "./SuggestedPrompts";
import { Overline } from "@leafygreen-ui/typography";
import MessageList from "./MessageList";
import Message from "./Message";
import { ParagraphSkeleton } from "@leafygreen-ui/skeleton-loader";
import IconButton from "@leafygreen-ui/icon-button";
import Icon from "@leafygreen-ui/icon";

function Disclosure() {
  return (
    <div className={styles.disclosure}>
      <Badge variant="blue">Experimental</Badge>
      <Body color={"#FFFFFF"}>
        By interacting with this chatbot, you agree to MongoDB's{" "}
        <Link href="#TODO">Terms & Conditions</Link>
      </Body>
    </div>
  );
}

type CTACardProps = {
  active: boolean;
  cardRef: React.RefObject<HTMLDivElement>;
  conversation: Conversation;
  inputText: string;
  activate: () => void;
  deactivate: () => void;
  setInputText: (text: string) => void;
  inputTextError: string;
  handleSubmit: (text: string) => Promise<void>;
  awaitingReply: boolean;
};

function CTACard({
  active,
  cardRef,
  conversation,
  inputText,
  activate,
  deactivate,
  setInputText,
  inputTextError,
  handleSubmit,
  awaitingReply,
}: CTACardProps) {
  const isEmptyConversation = conversation.messages.length === 0;
  const showSuggestedPrompts = inputText.length === 0;
  const showExperimentalBanner = inputText.length > 0;

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    // TODO: Make this work with <Card>. For some reason, <Card>
    // does not accept a ref prop even though it wraps <Box>, which
    // takes the ref just fine.
    <Box ref={cardRef} className={styles.card}>
      {active && !isEmptyConversation ? (
        <>
          <div className={styles.card_content_title}>
            <Subtitle>MongoDB AI</Subtitle>
            <Badge variant="blue">Experimental</Badge>

            <IconButton
              className={styles.card_content_title__right}
              aria-label="Close the chatbot window"
              active={false}
              onClick={() => deactivate()}
            >
              <Icon glyph="X" />
            </IconButton>
          </div>
          <MessageList>
            {conversation.messages.map((message) => (
              <Message
                key={message.id}
                message={message}
                rateMessage={conversation.rateMessage}
              />
            ))}
            {awaitingReply && (
              <Message role="assistant">
                <ParagraphSkeleton />
              </Message>
            )}
          </MessageList>
          <Banner className={styles.lg_banner} variant="warning">
            This is an experimental AI chatbot. All information should be
            verified prior to use.
          </Banner>
        </>
      ) : null}

      <ChatInput
        ref={inputRef}
        key="wizard-input"
        showSubmitButton={active && inputText.length > 0}
        placeholder={
          awaitingReply
            ? "MongoDB AI is answering..."
            : "Ask MongoDB AI a Question"
        }
        state={inputTextError ? "error" : "none"}
        errorMessage={inputTextError}
        canSubmit={inputTextError.length === 0}
        onFocus={() => {
          if (!active) {
            activate();
          }
        }}
        onButtonClick={() => {
          activate();
        }}
        value={inputText}
        onChange={(e) => {
          setInputText(e.target.value);
        }}
        loading={awaitingReply}
        handleSubmit={() => {
          handleSubmit(inputText);
        }}
      />

      {active && isEmptyConversation ? (
        !conversation.error ? (
          <div className={styles.card_content}>
            <div className={styles.chat}>
              {showSuggestedPrompts ? (
                <SuggestedPrompts
                  onPromptSelected={async (text) => {
                    await handleSubmit(text);
                  }}
                />
              ) : null}

              {showExperimentalBanner ? (
                <div className={styles.basic_banner}>
                  <Overline>ASK MONGODB AI</Overline>
                  <Badge variant="blue">Experimental</Badge>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <Banner className={styles.lg_banner} variant="danger">
            Something went wrong. Try reloading the page and starting a new
            conversation.
          </Banner>
        )
      ) : null}
    </Box>
  );
}

export default function Chatbot() {
  const conversation = useConversation();
  const [active, setActive] = useState(false);
  const [awaitingReply, setAwaitingReply] = useState(false);

  function activate() {
    if (active) {
      return;
    }
    setActive(true);
    if (!conversation.conversationId) {
      handleCreateConversation();
    }
  }

  function deactivate() {
    if(active) {
      setActive(false);
    }
  }

  async function handleCreateConversation() {
    try {
      await conversation.createConversation();
    } catch (e) {
      const errorMessage =
        typeof e === "string"
          ? e
          : e instanceof Error
          ? e.message
          : "Failed to create conversation.";
      conversation.endConversationWithError(errorMessage);
    }
  }

  const [inputData, setInputData] = useState({
    text: "",
    error: "",
  });
  const inputText = inputData.text;
  const inputTextError = inputData.error;
  function setInputText(text: string) {
    const isValid = text.length <= 300;
    setInputData({
      text,
      error: isValid ? "" : "Input must be less than 300 characters",
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
    if (awaitingReply) return;
    try {
      setInputText("");
      setAwaitingReply(true);
      await conversation.addMessage("user", text);
    } catch (e) {
      console.error(e);
    } finally {
      setAwaitingReply(false);
    }
    // setAwaitingReply(true);
    // setTimeout(() => {
    //   setAwaitingReply(false);
    //   conversation.addMessage(
    //     "assistant",
    //     "This is a test response.\n\nHere's some code you could run if you're brave enough:\n\n```javascript\nfunction hello() {\n  console.log('hello, world!');\n}\n\nhello()\n```\n"
    //   );
    // }, 4000);
    // setTimeout(() => {
    //   conversation.addMessage(
    //     "system",
    //     `#### There was a problem sending your message.\n\n#### Try asking your question again or reloading the page.`
    //   );
    // }, 300);
  };

  const cardBoundingBoxRef = useClickAway(() => {
    console.log("click away");
    setActive(false);
  });

  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.chatbot_container} ref={cardBoundingBoxRef}>
      <>
        <CSSTransition
          nodeRef={cardRef}
          in={active}
          timeout={{
            enter: 250,
            exit: 200,
          }}
          classNames={{
            enterActive: styles["card-enter"],
            enterDone: styles["card-enter-active"],
            exitActive: styles["card-exit"],
            exitDone: styles["card-exit-active"],
          }}
        >
          <CTACard
            cardRef={cardRef}
            conversation={conversation}
            active={active}
            activate={activate}
            deactivate={deactivate}
            inputText={inputText}
            setInputText={setInputText}
            inputTextError={inputTextError}
            handleSubmit={handleSubmit}
            awaitingReply={awaitingReply}
          />
        </CSSTransition>
        {!active ? <Disclosure /> : null}
      </>
    </div>
  );
}
