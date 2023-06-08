import Icon from "@leafygreen-ui/icon";
import IconButton from "@leafygreen-ui/icon-button";
import { Body, Description } from "@leafygreen-ui/typography";
import styles from "./Message.module.css";

export type SenderType = "user" | "assistant" | "system";

export type MessageData = {
  id: string;
  text: string;
  sender: {
    id: string;
    type: SenderType;
  };
};

export function createMessage(senderType: SenderType, text: string): MessageData {
  return {
    id: Math.random().toString(),
    text,
    sender: {
      id: Math.random().toString(),
      type: senderType,
    },
  }
}

function Avatar({ type }: { type: SenderType }) {
  const className = {
    user: `${styles.message_avatar} ${styles.message_avatar_user}`,
    assistant: `${styles.message_avatar} ${styles.message_avatar_assistant}`,
    system: `${styles.message_avatar} ${styles.message_avatar_system}`,
  }[type];

  const glyph = {
    user: "Person",
    assistant: "Wizard",
    system: "Settings",
  }[type];

  const color = {
    user: "#000000",
    assistant: "#00ff00",
    system: "#ff0000",
  }[type];

  return (
    <div className={className}>
      <Icon
        className={styles.message_avatar_icon}
        glyph={glyph}
        color={color}
      />
    </div>
  );
}

export function MessageRating() {
  return (
    <div className={styles.message_rating}>
      <Description>Rate this response:</Description>
      <IconButton size="large" aria-label="Thumbs Up">
        <Icon className={styles.message_rating_icon} glyph="ArrowUp" />
      </IconButton>
      <IconButton size="large" aria-label="Thumbs Down">
        <Icon className={styles.message_rating_icon} glyph="ArrowDown" />
      </IconButton>
    </div>
  );
}

export function Message({ message }: { message: MessageData }) {
  return (
    <div className={styles.message}>
      <Avatar type={message.sender.type} />
      <div className={styles.message_text}>
        <Body baseFontSize={16}>{message.text}</Body>
        {message.sender.type === "assistant" && <MessageRating />}
      </div>
    </div>
  );
}
