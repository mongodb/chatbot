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
  "messages" | "rateMessage"
> & {
  inputText: string;
  setInputText: React.Dispatch<React.SetStateAction<string>>;
}

export default function Chat(props: ChatProps) {
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
      <div className={styles.input_form}>
        <IconInput
          glyph="SMS"
          aria-label="MongoDB AI Chatbot Message Input"
          aria-labelledby="TBD - FIXME"
          placeholder={`Type a message or type "/" to select a prompt`}
          value={props.inputText}
          onChange={(e) => {
            props.setInputText(e.target.value);
          }}
        />
        <Button
          className={styles.input_form_submit}
          type="submit"
          rightGlyph={<Icon glyph="Wizard" />}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
