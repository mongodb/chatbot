import { Conversation } from "../../services/conversations";

export interface MessageResponse {
  id: string;
  role: string;
  content: string;
  rating?: boolean;
  createdAt: number;
}
export interface ConversationResponse {
  _id: string;
  messages: MessageResponse[];
  createdAt: number;
}
export function convertConversationToResponse(
  conversation: Conversation
): ConversationResponse {
  conversation.messages.shift(); // Remove the system prompt
  return {
    _id: conversation._id.toString(),
    messages: conversation.messages.map((message) => ({
      id: message.id.toString(),
      role: message.role,
      content: message.content,
      rating: message.rating,
      createdAt: message.createdAt.getTime(),
    })),
    createdAt: conversation.createdAt.getTime(),
  };
}
