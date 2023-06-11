import Icon from "@leafygreen-ui/icon";
import IconButton from "@leafygreen-ui/icon-button";
import { Body, Description } from "@leafygreen-ui/typography";
import styles from "./Message.module.css";
import { ConversationProviderValue } from "./ConversationProvider";
import { useEffect, useRef } from "react";

export type SenderType = "user" | "assistant" | "system";

export type MessageData = {
  id: string;
  text: string;
  sender: {
    id: string;
    type: SenderType;
  };
  rating?: boolean;
};

export function Avatar({ type }: { type: SenderType }) {
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

type MessageRatingProps = {
  messageId: string;
  rateMessage: ConversationProviderValue["rateMessage"];
  value?: boolean;
};

export function MessageRating(props: MessageRatingProps) {
  return (
    <div className={styles.message_rating}>
      <Description>Rate this response:</Description>
      <IconButton
        size="large"
        aria-label="Thumbs up this message"
        active={props.value === true}
        onClick={() => props.rateMessage(props.messageId, true)}
      >
        <Icon className={styles.message_rating_icon} glyph="ArrowUp" />
      </IconButton>
      <IconButton
        size="large"
        aria-label="Thumbs down this message"
        active={props.value === false}
        onClick={() => props.rateMessage(props.messageId, false)}
      >
        <Icon className={styles.message_rating_icon} glyph="ArrowDown" />
      </IconButton>
    </div>
  );
}

type MessageProps = {
  message: MessageData;
  rateMessage: ConversationProviderValue["rateMessage"];
};

export function Message(props: MessageProps) {
  const messageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messageRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, []);
  return (
    <div className={styles.message} ref={messageRef}>
      <Avatar type={props.message.sender.type} />
      <div className={styles.message_text}>
        <Body baseFontSize={16}>{props.message.text}</Body>
        {props.message.sender.type === "assistant" && (
          <MessageRating
            messageId={props.message.id}
            rateMessage={props.rateMessage}
            value={props.message.rating}
          />
        )}
      </div>
    </div>
  );
}
