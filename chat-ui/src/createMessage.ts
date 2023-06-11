import { MessageData, SenderType } from "./Message";

export default function createMessage(
  senderType: SenderType,
  text: string
): MessageData {
  return {
    id: Math.random().toString(),
    text,
    sender: {
      id: Math.random().toString(),
      type: senderType,
    },
  };
}
