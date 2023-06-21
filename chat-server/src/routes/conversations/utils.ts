import { Conversation } from "../../services/conversations";

export interface MessageResponse {
  id: string;
  role: string;
  content: string;
  rating?: boolean;
  timeCreated: number;
}
export interface ConversationResponse {
  id: string;
  messages: MessageResponse[];
  timeCreated: number;
}
export function convertConversationToResponse(
  conversation: Conversation
): ConversationResponse {
  conversation.messages.shift(); // Remove the system prompt
  return {
    id: conversation._id.toString(),
    messages: conversation.messages.map((message) => ({
      id: message.id.toString(),
      role: message.role,
      content: message.content,
      rating: message.rating,
      timeCreated: message.timeCreated.getTime(),
    })),
    timeCreated: conversation.timeCreated.getTime(),
  };
}
