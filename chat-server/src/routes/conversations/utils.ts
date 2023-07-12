import { isIP } from "net";
import { Address6 } from "ip-address";
import { Conversation, Message } from "../../services/conversations";
import { z } from "zod";

export type ApiMessage = z.infer<typeof ApiMessage>;
export const ApiMessage = z.object({
  id: z.string(),
  role: z.string(),
  content: z.string(),
  rating: z.boolean().optional(),
  createdAt: z.number(),
});

export type ApiConversation = z.infer<typeof ApiConversation>;
export const ApiConversation = z.object({
  _id: z.string(),
  messages: z.array(ApiMessage),
  createdAt: z.number(),
});

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

export function areEquivalentIpAddresses(ip1: string, ip2: string) {
  if (Address6.isValid(ip1)) {
    ip1 = new Address6(ip1).to4().correctForm();
  }
  if (Address6.isValid(ip2)) {
    ip2 = new Address6(ip2).to4().correctForm();
  }
  return ip1 === ip2;
}
