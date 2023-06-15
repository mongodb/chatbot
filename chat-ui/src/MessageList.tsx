import styles from "./MessageList.module.css";
import { ReactNode } from "react";

type MessageListItemProps = { children: JSX.Element };

export function MessageListItem({ children }: MessageListItemProps) {
  return <div className={styles.message_list_item}>{children}</div>;
}

type MessageListProps = {
  children: ReactNode;
};

export default function MessageList({ children }: MessageListProps) {
  return <div className={styles.message_list}>{children}</div>;
}
