import Banner from "@leafygreen-ui/banner";
import { ChatInput } from "./TextInput";
import { Message, MessageData, SenderType } from "./Message";

import styles from "./Chat.module.css";
import { ConversationProviderValue } from "./ConversationProvider";

type ChatProps = Pick<
  ConversationProviderValue,
  "messages" | "addMessage" | "rateMessage"
>;

export function Chat(props: ChatProps) {
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
      <ChatInput
        onSubmit={(text: string) => {
          props.addMessage("user", text);
        }}
      />
    </div>
  );
}
