import { MessageData, Role } from "./services/conversations";

export default function createMessage(
  role: Role,
  content: string
): MessageData {
  return {
    id: Math.random().toString(),
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}
