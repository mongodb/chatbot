import { useState, useRef, useEffect } from "react";
import Card from "@leafygreen-ui/card";
import Badge from "@leafygreen-ui/badge";
import { H3, Overline } from "@leafygreen-ui/typography";

import Chat from "./Chat";
import IconInput from "./IconInput";
import useConversation, { ConversationPayload } from "./useConversation";

import styles from "./Modal.module.css";
import SuggestedPrompts from "./SuggestedPrompts";

export function EmptyConversation({ addMessage }: ConversationPayload) {
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
            addMessage("user", inputText);
            setInputText("");
          }
        }}
      />
      {inputText.length === 0 ? (
        <SuggestedPrompts
          onPromptSelected={(text) => addMessage("user", text)}
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

export function ConversationWithMessages({
  messages,
  addMessage,
  rateMessage,
}: ConversationPayload) {
  return (
    <>
      <div className={styles.modal_title}>
        <H3>MongoDB AI</H3>
        <Badge variant="green">Experimental</Badge>
      </div>
      <Chat
        messages={messages}
        addMessage={addMessage}
        rateMessage={rateMessage}
      />
    </>
  );
}

export default function ChatbotModalContent({
  conversation,
}: {
  conversation: ConversationPayload;
}) {
  return conversation.messages.length === 0 ? (
    <EmptyConversation {...conversation} />
  ) : (
    <ConversationWithMessages {...conversation} />
  );
}

export function ChatbotModalCard() {
  const conversation = useConversation();
  return (
    <Card className={styles.modal}>
      <ChatbotModalContent conversation={conversation} />
    </Card>
  );
}
