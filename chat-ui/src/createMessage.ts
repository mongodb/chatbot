import { MessageData, Role } from "./services/conversations";

export function createMessageId() {
  const now = Date.now();
  const nonce = Math.floor(Math.random() * 1000);
  return String(now + nonce);
}

export default function createMessage(
  role: Role,
  content: string
): MessageData {
  return {
    id: createMessageId(),
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}
