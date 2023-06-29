import { isIP } from "net";
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
  conversation.messages.shift(); // Remove the system prompt
  return {
    _id: conversation._id.toString(),
    messages: conversation.messages.map(convertMessageFromDbToApi),
    createdAt: conversation.createdAt.getTime(),
  };
}

export function isValidIp(ip: string) {
  return isIP(ip) > 0;
}
