import { isIP } from "net";
import { Address6 } from "ip-address";
import { Conversation, Message } from "../../services/conversations";
import { References } from "./addMessageToConversation";
export interface ApiMessage {
  id: string;
  role: string;
  content: string;
  rating?: boolean;
  createdAt: number;
  references?: References;
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
    references: message.references,
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

export function isValidIp(ip: string) {
  return isIP(ip) > 0;
}

export function areEquivalentIpAddresses(ip1: string, ip2: string) {
  if (Address6.isValid(ip1)) {
    ip1 = new Address6(ip1).to4().correctForm();
  }
  if (Address6.isValid(ip2)) {
    ip2 = new Address6(ip2).to4().correctForm();
  }
  return ip1 === ip2;
}
