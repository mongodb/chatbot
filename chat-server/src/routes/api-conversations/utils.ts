import { ApiConversation } from "../../services/ApiConversations";
import { ConversationForApi, convertMessageFromDbToApi } from "../utils";

export function convertApiConversationFromDbToApi(
  conversation: ApiConversation
): ConversationForApi {
  const nonSystemMessages = conversation.messages.filter(
    (msg) => msg.role !== "system"
  );
  return {
    _id: conversation._id.toString(),
    messages: nonSystemMessages.map(convertMessageFromDbToApi),
    createdAt: conversation.createdAt.getTime(),
  };
}
