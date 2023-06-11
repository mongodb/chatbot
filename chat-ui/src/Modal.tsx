import Card from "@leafygreen-ui/card";
import Badge from "@leafygreen-ui/badge";
import { H3, Overline } from "@leafygreen-ui/typography";
import Modal from "@leafygreen-ui/modal";

import { Chat } from "./Chat";
import { IconInput } from "./IconInput";
import useConversation from "./useConversation";

import styles from "./Modal.module.css";
import SuggestedPrompts from "./SuggestedPrompts";
import { useState } from "react";

function EmptyConversation() {
  const conversation = useConversation();
  const [inputText, setInputText] = useState("");

  return (
    <div className={styles.modal_empty}>
      <IconInput
        glyph="Wizard"
        aria-label="MongoDB AI Chatbot Message Input"
        aria-labelledby="TBD - FIXME"
        placeholder="Ask MongoDB AI a Question"
        value={inputText}
        onChange={(e) => {
          setInputText(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            conversation.addMessage("user", inputText);
            setInputText("");
          }
        }}
      />
      {inputText.length === 0 ? (
        <SuggestedPrompts
          onPromptSelected={(text) => conversation.addMessage("user", text)}
        />
      ) : (
        <div className={styles.modal_basic_banner}>
          <Overline>ASK MONGODB AI</Overline>
          <Badge variant="blue">Experimental</Badge>
        </div>
      )}
    </div>
  );
}

function ConversationWithMessages() {
  const conversation = useConversation();
  return (
    <>
      <div className={styles.modal_title}>
        <H3>MongoDB AI</H3>
        <Badge variant="green">Experimental</Badge>
      </div>
      <Chat
        messages={conversation.messages}
        addMessage={conversation.addMessage}
        rateMessage={conversation.rateMessage}
      />
    </>
  );
}

export function ChatbotModalContent() {
  const conversation = useConversation();
  return conversation.messages.length === 0 ? (
    <EmptyConversation />
  ) : (
    <ConversationWithMessages />
  );
}

export default function ChatbotModalCard() {
  return (
    <Card className={styles.modal}>
      <ChatbotModalContent />
    </Card>
  );
}
