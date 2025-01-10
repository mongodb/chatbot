import { type References } from "./references";
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
      id?: string;
      role: "assistant";
      content: string;
      references?: References;
      metadata?: AssistantMessageMetadata;
    }
  | {
      id?: string;
      role: "user";
      content: string;
    };

export default function createMessage(args: CreateMessageArgs): MessageData {
  const message: MessageData = {
    id: args.id ?? createMessageId(),
    createdAt: new Date().toISOString(),
    ...args,
  };
  return message;
}
