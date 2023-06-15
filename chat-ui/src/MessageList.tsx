import styles from "./MessageList.module.css";
import { MessageProps } from "./Message";
import { ReactElement, ReactNode } from "react";

type MessageListItemProps = { children: JSX.Element };

export function MessageListItem({ children }: MessageListItemProps) {
  return <div className={styles.message_list_item}>{children}</div>;
}

type MessageListChild =
  | ReactElement<MessageProps>
  | ReactElement<MessageListItemProps>;

type MessageListProps = {
  children: MessageListChild | MessageListChild[];
  // children: JSX.Element;
};

export default function MessageList({ children }: MessageListProps) {
  return <div className={styles.message_list}>{children}</div>;
}
