import styles from "./CallToActionInput.module.css";
import { useState, useRef, useEffect } from "react";
import Badge from "@leafygreen-ui/badge";
import Card from "@leafygreen-ui/card";
import { Body, Link } from "@leafygreen-ui/typography";
import Modal from "@leafygreen-ui/modal";
import IconInput from "./IconInput";
import useInputFocusListener from "./useInputFocusListener";
import ChatbotModalContent, {
  EmptyConversation,
  ConversationWithMessages,
} from "./Modal";
import useConversation from "./useConversation";
import useElementBoundingBoxClickHandler from "./useElementBoundingBoxClickHandler";
import { Transition, CSSTransition } from "react-transition-group";

type CallToActionInputProps = {};

export default function CallToActionInput(props: CallToActionInputProps) {
  const conversation = useConversation();
  const [modalOpen, setModalOpen] = useState(false);
  const { inputRef } = useInputFocusListener({
    onFocus: () => {
      if (!modalOpen) {
        setModalOpen(true);
      }
    },
  });

  const cardRef = useElementBoundingBoxClickHandler({
    onClickOutside: () => {
      setModalOpen(false);
    },
  });

  return (
    <div ref={cardRef}>
      <Card className={styles.cta_container}>
        <IconInput
          ref={inputRef}
          glyph="Wizard"
          aria-label="MongoDB AI Chatbot Message Input"
          aria-labelledby="TBD - FIXME"
          placeholder="Ask MongoDB AI a Question"
        />
        {!modalOpen ? (
          <div className={styles.cta_disclosure}>
            <Badge variant="blue">Experimental</Badge>
            <Body>
              By interacting with this chatbot, you agree to xyz.{" "}
              <Link href="#">Terms & Conditions</Link>
            </Body>
          </div>
        ) : (
          <div className={styles.modal_content}>
            {conversation.messages.length === 0 ? (
              <EmptyConversation {...conversation} />
            ) : (
              <ConversationWithMessages {...conversation} />
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
