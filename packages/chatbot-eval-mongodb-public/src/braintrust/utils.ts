import { strict as assert } from "assert";
import {
  ConversationGeneratedData,
  SomeGeneratedData,
} from "mongodb-chatbot-evaluation";
import {
  Conversation,
  UserMessage,
  AssistantMessage,
} from "mongodb-chatbot-server";
import z from "zod";

export function extractConversationEvalData(
  conversationGeneratedData: ConversationGeneratedData
) {
  const { data: conversation } = conversationGeneratedData;
  const userMessage = getLastUserMessageFromConversation(conversation);
  const contexts = getContextsFromUserMessage(userMessage);
  const { content: output } =
    getLastAssistantMessageFromConversation(conversation);
  return {
    input: userMessage.content,
    output,
    contexts,
    tags: conversationGeneratedData.evalData.tags,
  };
}

export function getLastUserMessageFromConversation(
  conversation: Conversation
): UserMessage {
  const userMessage = [...conversation.messages]
    .reverse()
    .find((m) => m.role === "user");
  assert(userMessage, "Conversation must have a UserMessage");
  return userMessage as UserMessage;
}
export function getLastAssistantMessageFromConversation(
  conversation: Conversation
): AssistantMessage {
  const assistantMessage = [...conversation.messages]
    .reverse()
    .find((m) => m.role === "assistant");
  assert(assistantMessage, "Conversation must have a AssistantMessage");
  return assistantMessage as AssistantMessage;
}

export function getContextsFromUserMessage(userMessage: UserMessage) {
  const { data: contexts } = z
    .array(z.string())
    .safeParse(userMessage.contextContent?.map((cc) => cc.text));
  // Return empty array if no context text found
  return contexts ?? [];
}
export function checkConversationGeneratedData(
  generatedData?: SomeGeneratedData
) {
  assert(generatedData?.type === "conversation", "Must be conversation data");
  return generatedData as ConversationGeneratedData;
}
