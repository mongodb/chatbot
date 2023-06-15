import styles from "./MessageList.module.css";
import { Message } from "./Message";
import { Conversation } from "./useConversation";

type MessageListProps = Pick<Conversation, "messages" | "rateMessage">;

export default function MessageList(props: MessageListProps) {
  return (
    <div className={styles.message_list}>
      {props.messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          rateMessage={props.rateMessage}
        />
      ))}
    </div>
  );
}
