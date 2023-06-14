import styles from "./CallToActionInput.module.css";
import { useState, useRef, useEffect } from "react";
import Badge from "@leafygreen-ui/badge";
import Card from "@leafygreen-ui/card";
import { Body, Link } from "@leafygreen-ui/typography";
import IconInput from "./IconInput";
import ChatbotModalContent, {
  EmptyConversation,
  ConversationWithMessages,
} from "./Modal";
import useConversation, { ConversationPayload } from "./useConversation";
import { Transition, CSSTransition } from "react-transition-group";
import { useClickAway } from "@uidotdev/usehooks";
import Button from "@leafygreen-ui/button";
import Icon from "@leafygreen-ui/icon";

const transitionClassName = {
  entering: " s-focused s-entering",
  entered: " s-focused s-entered",
  exiting: " s-focused s-exiting",
  exited: "",
};

type ReactTransitionGroupState = "entering" | "entered" | "exiting" | "exited";

type CTACardProps = {
  active: boolean;
  cardRef: React.RefObject<HTMLDivElement>;
  conversation: ConversationPayload;
  inputText: string;
  setActive: React.Dispatch<React.SetStateAction<boolean>>;
  setInputText: React.Dispatch<React.SetStateAction<string>>;
  state: ReactTransitionGroupState;
};

function CTACard({
  active,
  cardRef,
  conversation,
  inputText,
  setActive,
  setInputText,
  state,
}: CTACardProps) {
  const isEmptyConversation = conversation.messages.length === 0;
  const showMainInput = !active || isEmptyConversation;

  let cardClassName = `${styles.card} ${transitionClassName[state]}`;
  if (state === "exited") {
    cardClassName += ` ${styles["s-unfocused"]}`;
  }
  return (
    <Card ref={cardRef} className={cardClassName}>
      {showMainInput ? (
        <>
          <IconInput
            glyph="Wizard"
            aria-label="MongoDB AI Chatbot Message Input"
            aria-labelledby="TBD - FIXME"
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
          {inputText.length === 0 ? null : (
            <Button
              className={styles.input_form_submit}
              type="submit"
              rightGlyph={<Icon glyph="Wizard" />}
            >
              Send
            </Button>
          )}
        </>
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
            <EmptyConversation {...conversation} />
          ) : (
            <ConversationWithMessages
              {...conversation}
              inputText={inputText}
              setInputText={setInputText}
            />
          )}
        </div>
      )}
    </Card>
  );
}

export default function CallToActionInput() {
  const conversation = useConversation();
  const [modalOpen, setModalOpen] = useState(false);

  const cardBoundingBoxRef = useClickAway(() => {
    setModalOpen(false);
  });

  const cardRef = useRef<HTMLDivElement>(null);

  const [inputText, setInputText] = useState("");
  const handleSubmit = () => {
    conversation.addMessage("user", inputText);
    setInputText("");
  };

  return (
    <div className={styles.cta_container} ref={cardBoundingBoxRef}>
      <form
        className={styles.input_form}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <Transition
          nodeRef={cardRef}
          in={modalOpen}
          timeout={{
            appear: 250,
            enter: 250,
            exit: 250,
          }}
        >
          {(state: "entering" | "entered" | "exiting" | "exited") => (
            <CTACard
              cardRef={cardRef}
              conversation={conversation}
              state={state}
              active={modalOpen}
              setActive={setModalOpen}
              inputText={inputText}
              setInputText={setInputText}
            />
          )}
        </Transition>
      </form>
    </div>
  );
}
