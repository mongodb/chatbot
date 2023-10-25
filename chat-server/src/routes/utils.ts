import { References } from "chat-core";
import { isIP } from "net";
import { z } from "zod";
import { AssistantMessage, Message } from "../services/conversations";

export function isValidIp(ip?: string) {
  return ip !== undefined && isIP(ip) > 0;
}

export type ApiMessage = z.infer<typeof ApiMessage>;
export const ApiMessage = z.object({
  id: z.string(),
  role: z.enum(["system", "assistant", "user", "function"]),
  content: z.string(),
  rating: z.boolean().optional(),
  createdAt: z.number(),
  references: References.optional(),
});

export type ConversationForApi = z.infer<typeof ConversationForApi>;
export const ConversationForApi = z.object({
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
