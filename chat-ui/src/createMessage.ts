import { MessageData, Role } from "./Message";

export default function createMessage(
  role: Role,
  content: string
): MessageData {
  return {
    id: Math.random().toString(),
    role,
    content,
  };
}
