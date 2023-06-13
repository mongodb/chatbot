import styles from "./CallToActionInput.module.css";
import Badge from "@leafygreen-ui/badge";
import { Body, Link } from "@leafygreen-ui/typography";
import Modal from "@leafygreen-ui/modal";
import IconInput from "./IconInput";
import useInputFocusListener from "./useInputFocusListener";
import { useState } from "react";
import ChatbotModalContent from "./Modal";
import useConversation from "./useConversation";

type CallToActionInputProps = {
  showModal: boolean;
};

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

  return (
    <>
      <div className={styles.cta_container}>
        <IconInput
          ref={inputRef}
          glyph="Wizard"
          aria-label="MongoDB AI Chatbot Message Input"
          aria-labelledby="TBD - FIXME"
          placeholder="Ask MongoDB AI a Question"
        />
        <div className={styles.cta_disclosure}>
          <Badge variant="blue">Experimental</Badge>
          <Body>
            By interacting with this chatbot, you agree to xyz.{" "}
            <Link href="#">Terms & Conditions</Link>
          </Body>
        </div>
      </div>
      {props.showModal ? (
        <Modal open={modalOpen} setOpen={isOpening => {
          setModalOpen(isOpening);
          if(isOpening) {
            inputRef.current.focus()
          } else {
            inputRef.current.blur()
          }
        }} size="large">
          <div className={styles.modal_content}>
            <ChatbotModalContent conversation={conversation} />
          </div>
        </Modal>
      ) : null}
    </>
  );
}
