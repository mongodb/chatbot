import styles from "./CallToActionInput.module.css";
import Badge from "@leafygreen-ui/badge";
import { Body, Link } from "@leafygreen-ui/typography";
import Modal from "@leafygreen-ui/modal";
import IconInput from "./IconInput";
import useInputFocusRef from "./useInputFocusRef";
import { useState } from "react";
import ChatbotModalContent from "./Modal";

type CallToActionInputProps = {
  showModal: boolean;
};

export default function CallToActionInput(props: CallToActionInputProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { inputRef } = useInputFocusRef({
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
        <Modal open={modalOpen} setOpen={setModalOpen} size="large">
          <div className={styles.modal_content}>
            <ChatbotModalContent />
          </div>
        </Modal>
      ) : null}
    </>
  );
}
