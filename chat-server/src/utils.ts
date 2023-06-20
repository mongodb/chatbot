import { Request } from "express";
import { Conversation } from "./services/conversations";

/**
 * Checks for req-id Request Header. Returns an empty string if the header is not
 * a truthy string.
 *
 * @param req
 * @returns
 */
export const getRequestId = (req: Request) => {
  const reqId = req.headers["req-id"];
  if (!reqId) {
    return undefined;
  } else if (Array.isArray(reqId)) {
    return undefined;
  } else {
    return reqId;
  }
};

// helpers

interface MessageResponse {
  id: string;
  role: string;
  content: string;
  rating?: boolean;
}
export interface ConversationResponse {
  id: string;
  messages: MessageResponse[];
}
export function convertConversationToResponse(
  conversation: Conversation
): ConversationResponse {
  return {
    id: conversation._id.toString(),
    messages: conversation.messages.map((message) => ({
      id: message.id.toString(),
      role: message.role,
      content: message.content,
      rating: message.rating,
    })),
  };
}
