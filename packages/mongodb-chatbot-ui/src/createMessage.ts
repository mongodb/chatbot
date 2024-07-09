import { References } from "mongodb-rag-core";
import {
  AssistantMessageMetadata,
  MessageData,
} from "./services/conversations";

export function createMessageId() {
  const now = Date.now();
  const nonce = Math.floor(Math.random() * 100000);
  return String(now + nonce);
}

export type CreateMessageArgs =
  | {
      role: "assistant";
      content: string;
      references?: References;
      metadata?: AssistantMessageMetadata;
    }
  | {
      role: "user";
      content: string;
    };

export default function createMessage(args: CreateMessageArgs): MessageData {
  const message: MessageData = {
    id: createMessageId(),
    createdAt: new Date().toISOString(),
    ...args,
  };
  return message;
}
