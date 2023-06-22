import styles from "./Chatbot.module.css";
import { useState, useRef, useEffect } from "react";
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

export const ChatbotStyles = styles;

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
  setActive: React.Dispatch<React.SetStateAction<boolean>>;
  setInputText: React.Dispatch<React.SetStateAction<string>>;
  isValidInputText: boolean;
  handleSubmit: (text: string) => Promise<void>;
  awaitingReply: boolean;
};

function CTACard({
  active,
  cardRef,
  conversation,
  inputText,
  setActive,
  setInputText,
  isValidInputText,
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
        state={isValidInputText ? "none" : "error"}
        errorMessage={isValidInputText ? "" : "Input must be less than 300 characters"}
        canSubmit={isValidInputText}
        onFocus={() => {
          if (!active) {
            setActive(true);
          }
        }}
        onButtonClick={() => {
          setActive(true);
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

      {!active ? (
        <Disclosure />
      ) : isEmptyConversation ? (
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
      ) : null}
    </Box>
  );
}

export default function Chatbot() {
  console.log("Chatbot rendered xx");
  const conversation = useConversation();
  const [active, setActive] = useState(false);
  const [awaitingReply, setAwaitingReply] = useState(false);
  // When the Chatbot first becomes active, create a new conversation
  useEffect(() => {
    if (active && !conversation.conversationId) {
      conversation.createConversation();
    }
  }, [active, conversation]);

  const [inputText, setInputText] = useState("");
  const [isValidInputText, setIsValidInputText] = useState(true);
  function validateInputText(text: string) {
    const isValid = text.length <= 300;
    setIsValidInputText(isValid);
  }

  const handleSubmit = async (text: string) => {
    if (!conversation.conversationId) {
      console.error(`Cannot addMessage without a conversationId`);
      return;
    }
    if(!isValidInputText) {
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
    }
    setAwaitingReply(true);
    setTimeout(() => {
      setAwaitingReply(false);
      conversation.addMessage(
        "assistant",
        "This is a test response.\n\nHere's some code you could run if you're brave enough:\n\n```javascript\nfunction hello() {\n  console.log('hello, world!');\n}\n\nhello()\n```\n"
      );
    }, 4000);
  };
  const cardBoundingBoxRef = useClickAway(() => {
    setActive(false);
  });
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.chatbot_container} ref={cardBoundingBoxRef}>
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
          setActive={setActive}
          inputText={inputText}
          setInputText={(text) => {
            validateInputText(text);
            setInputText(text)
          }}
          isValidInputText={isValidInputText}
          handleSubmit={handleSubmit}
          awaitingReply={awaitingReply}
        />
      </CSSTransition>
    </div>
  );
}
