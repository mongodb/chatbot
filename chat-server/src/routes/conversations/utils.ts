import { isIP } from "net";
import { Address6 } from "ip-address";
import {
  Conversation,
  Message,
  AssistantMessage,
} from "../../services/conversations";
import { References } from "chat-core";
import { z } from "zod";

export type ApiMessage = z.infer<typeof ApiMessage>;
export const ApiMessage = z.object({
  id: z.string(),
  role: z.enum(["system", "assistant", "user"]),
  content: z.string(),
  rating: z.boolean().optional(),
  createdAt: z.number(),
  references: References.optional(),
});

export type ApiConversation = z.infer<typeof ApiConversation>;
export const ApiConversation = z.object({
  _id: z.string(),
  messages: z.array(ApiMessage),
  createdAt: z.number(),
});

export function convertMessageFromDbToApi(message: Message): ApiMessage {
  const { id, createdAt, role, content } = message;
  const { rating, references } = message as Partial<AssistantMessage>;
  return {
    id: id.toString(),
    role,
    content,
    createdAt: createdAt.getTime(),
    rating,
    references,
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

export function isValidIp(ip?: string) {
  return ip !== undefined && isIP(ip) > 0;
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
