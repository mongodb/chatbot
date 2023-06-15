import styles from "./CallToActionInput.module.css";
import { useState, useRef } from "react";
import Badge from "@leafygreen-ui/badge";
import Card from "@leafygreen-ui/card";
import Box from "@leafygreen-ui/box";
import { Body, Link } from "@leafygreen-ui/typography";
import { EmptyConversation, ConversationWithMessages } from "./Modal";
import useConversation, { ConversationPayload } from "./useConversation";
import {
  // Transition,
  CSSTransition,
} from "react-transition-group";
import { useClickAway } from "@uidotdev/usehooks";
import WizardInput from "./ChatInput";

const transitionClassName = {
  entering: " s-focused s-entering",
  entered: " s-focused s-entered",
  exiting: " s-focused s-exiting",
  exited: "",
};

// type ReactTransitionGroupState = "entering" | "entered" | "exiting" | "exited";

type CTACardProps = {
  active: boolean;
  cardRef: React.RefObject<HTMLDivElement>;
  conversation: ConversationPayload;
  inputText: string;
  setActive: React.Dispatch<React.SetStateAction<boolean>>;
  setInputText: React.Dispatch<React.SetStateAction<string>>;
  // state: ReactTransitionGroupState;
};

function CTACard({
  active,
  cardRef,
  conversation,
  inputText,
  setActive,
  setInputText,
}: // state,
CTACardProps) {
  const isEmptyConversation = conversation.messages.length === 0;
  const showMainInput = !active || isEmptyConversation;

  return (
    // TODO: Make this work with <Card>. For some reason, <Card>
    // does not accept a ref prop even though it wraps <Box>, which
    // takes the ref just fine.
    <Box ref={cardRef} className={styles.card + " card"}>
      {showMainInput ? (
        <WizardInput
          showSubmitButton={inputText.length > 0}
          placeholder="Ask MongoDB AI a Question"
          onFocus={() => {
            if (!active) {
              setActive(true);
            }
          }}
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
          }}
        />
      ) : null}
      {!active ? (
        <div className={styles.cta_disclosure}>
          <Badge variant="blue">Experimental</Badge>
          <Body>
            By interacting with this chatbot, you agree to xyz.{" "}
            <Link href="#">Terms & Conditions</Link>
          </Body>
        </div>
      ) : (
        <div className={styles.modal_content}>
          {isEmptyConversation ? (
            <EmptyConversation
              addMessage={conversation.addMessage}
              showSuggestedPrompts={inputText.length === 0}
              showExperimentalBanner={inputText.length > 0}
            />
          ) : (
            <ConversationWithMessages
              {...conversation}
              inputText={inputText}
              setInputText={setInputText}
            />
          )}
        </div>
      )}
    </Box>
  );
}

export default function CallToActionInput() {
  const conversation = useConversation();
  const [active, setActive] = useState(false);
  const [inputText, setInputText] = useState("");
  const handleSubmit = () => {
    conversation.addMessage("user", inputText);
    setInputText("");
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
          handleSubmit();
        }}
      >
        <CSSTransition
          nodeRef={cardRef}
          in={active}
          timeout={250}
          classNames={{
            enterActive: styles["cta-card-enter"],
            enterDone: styles["cta-card-enter-active"],
            exitActive: styles["cta-card-exit"],
            exitDone: styles["cta-card-exit-active"],
          }}
        >
          <CTACard
            cardRef={cardRef}
            conversation={conversation}
            active={active}
            setActive={setActive}
            inputText={inputText}
            setInputText={setInputText}
          />
        </CSSTransition>
      </form>
    </div>
  );
}
