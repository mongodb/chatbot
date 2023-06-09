import Banner from "@leafygreen-ui/banner";
import { IconInput } from "./IconInput";
import { Message } from "./Message";

import styles from "./Chat.module.css";
import { ConversationProviderValue } from "./ConversationProvider";
import { useState } from "react";

type ChatProps = Pick<
  ConversationProviderValue,
  "messages" | "addMessage" | "rateMessage"
>;

export function Chat(props: ChatProps) {
  const [inputText, setInputText] = useState("");

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
      <IconInput
        glyph="SMS"
        aria-label="MongoDB AI Chatbot Message Input"
        aria-labelledby="TBD - FIXME"
        placeholder={`Type a message or type "/" to select a prompt`}
        value={inputText}
        onChange={(e) => {
          setInputText(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            props.addMessage("user", inputText);
            setInputText("");
          }
        }}
      />
    </div>
  );
}
