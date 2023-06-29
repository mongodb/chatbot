import { Conversation, Message } from "../../services/conversations";

export interface ApiMessage {
  id: string;
  role: string;
  content: string;
  rating?: boolean;
  createdAt: number;
}
export interface ApiConversation {
  _id: string;
  messages: ApiMessage[];
  createdAt: number;
}

export function convertMessageFromDbToApi(message: Message): ApiMessage {
  return {
    id: message.id.toString(),
    role: message.role,
    content: message.content,
    rating: message.rating,
    createdAt: message.createdAt.getTime(),
  };
}
export function convertConversationFromDbToApi(
  conversation: Conversation
): ApiConversation {
  const nonSystemMessages = conversation.messages.filter(
    (msg) => msg.role !== "system"
  );
  return {
    _id: conversation._id.toString(),
    messages: nonSystemMessages.map(convertMessageFromDbToApi),
    createdAt: conversation.createdAt.getTime(),
  };
}
