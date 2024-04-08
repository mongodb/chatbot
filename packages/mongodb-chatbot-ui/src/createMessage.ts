import {
  AssistantMessageMetadata,
  MessageData,
  Role,
} from "./services/conversations";

export function createMessageId() {
  const now = Date.now();
  const nonce = Math.floor(Math.random() * 100000);
  return String(now + nonce);
}

export default function createMessage(
  role: Role,
  content: string,
  metadata?: AssistantMessageMetadata
): MessageData {
  const message: MessageData = {
    id: createMessageId(),
    role,
    content,
    createdAt: new Date().toISOString(),
  };
  if (metadata) {
    message.metadata = metadata;
  }
  return message;
}
