import styles from "./Chatbot.module.css";
import { useState, useRef } from "react";
import Badge from "@leafygreen-ui/badge";
import Banner from "@leafygreen-ui/banner";
import Card from "@leafygreen-ui/card";
import Box from "@leafygreen-ui/box";
import { Body, Link } from "@leafygreen-ui/typography";
import useConversation, { Conversation } from "./useConversation";
import { CSSTransition } from "react-transition-group";
import { useClickAway } from "@uidotdev/usehooks";
import ChatInput from "./ChatInput";
import SuggestedPrompts from "./SuggestedPrompts";
import { H3, Overline } from "@leafygreen-ui/typography";
import Chat, { MessageList } from "./Chat";
import { conversationService } from "./services/conversations";

function Disclosure() {
  return (
    <div className={styles.cta_disclosure}>
      <Badge variant="blue">Experimental</Badge>
      <Body>
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
  handleSubmit: (text: string) => Promise<void>;
};

function CTACard({
  active,
  cardRef,
  conversation,
  inputText,
  setActive,
  setInputText,
  handleSubmit,
}: CTACardProps) {
  const isEmptyConversation = conversation.messages.length === 0;
  const showSuggestedPrompts = inputText.length === 0;
  const showExperimentalBanner = inputText.length > 0;

  return (
    // TODO: Make this work with <Card>. For some reason, <Card>
    // does not accept a ref prop even though it wraps <Box>, which
    // takes the ref just fine.
    <Card ref={cardRef} className={styles.card + " card"}>
      {active && !isEmptyConversation ? (
        <>
          <div className={styles.card_content_title}>
            <H3>MongoDB AI</H3>
            <Badge variant="green">Experimental</Badge>
          </div>
          <MessageList
            messages={conversation.messages}
            rateMessage={conversation.rateMessage}
          />
          <Banner className={styles.lg_banner} variant="warning">
            This is an experimental AI chatbot. All information should be
            verified prior to use.
          </Banner>
        </>
      ) : null}

      <ChatInput
        key="wizard-input"
        showSubmitButton={inputText.length > 0}
        placeholder="Ask MongoDB AI a Question"
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
    </Card>
  );
}

export default function Chatbot() {
  const conversation = useConversation();
  const [active, setActive] = useState(false);
  const [inputText, setInputText] = useState("");
  const handleSubmit = async (text: string) => {
    if (!conversation.conversationId) {
      console.error(`Cannot addMessage without a conversationId`);
      return;
    }
    try {
      await conversationService.addMessage({
        conversationId: conversation.conversationId,
        message: text,
      });
      conversation.addMessage("user", text);
      setInputText("");
    } catch (e) {
      console.error(e);
    }
  };
  const cardBoundingBoxRef = useClickAway(() => {
    setActive(false);
  });
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.cta_container} ref={cardBoundingBoxRef}>
      <form
        className={styles.input_form}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(inputText);
        }}
      >
        <CSSTransition
          nodeRef={cardRef}
          in={active}
          timeout={250}
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
            setInputText={setInputText}
            handleSubmit={handleSubmit}
          />
        </CSSTransition>
      </form>
    </div>
  );
}
