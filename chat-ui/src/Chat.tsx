import Banner from "@leafygreen-ui/banner";
import Button from "@leafygreen-ui/button";
import Icon from "@leafygreen-ui/icon";
import IconInput from "./IconInput";
import { Message } from "./Message";

import styles from "./Chat.module.css";
import { ConversationPayload } from "./useConversation";
import { useState } from "react";

type ChatProps = Pick<
  ConversationPayload,
  "messages" | "addMessage" | "rateMessage"
>;

export default function Chat(props: ChatProps) {
  const [inputText, setInputText] = useState("");

  const handleSubmit = () => {
    props.addMessage("user", inputText);
    setInputText("");
  };

  return (
    <div className={styles.chat}>
      <div className={styles.message_list}>
        {props.messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            rateMessage={props.rateMessage}
          />
        ))}
      </div>
      <Banner variant="warning">
        This is an experimental AI chatbot. All information should be verified
        prior to use.
      </Banner>
      <form
        className={styles.input_form}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <IconInput
          glyph="SMS"
          aria-label="MongoDB AI Chatbot Message Input"
          aria-labelledby="TBD - FIXME"
          placeholder={`Type a message or type "/" to select a prompt`}
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
          }}
        />
        <Button className={styles.input_form_submit} type="submit" rightGlyph={
          <Icon glyph="Wizard" />
        }>
          Send
        </Button>
      </form>
    </div>
  );
}
