import { ConversationsService } from "mongodb-chatbot-server";
import { Express } from "express";
import request from "supertest";
import { strict as assert } from "assert";
import { stringifyConversation } from "./stringifyConversation";
import { TestCaseMessage } from "./TestCase";

export async function generateTranscript({
  app,
  conversations,
  endpoint,
  ipAddress,
  messages,
}: {
  app: Express;
  conversations: ConversationsService;
  endpoint: string;
  ipAddress: string;
  messages: TestCaseMessage[];
}) {
  assert(messages.length > 0, "test case must have at least one message");

  const conversation = await conversations.create({ ipAddress });
  const [setUpMessages, testMessage] = [messages.slice(0, -1), messages.pop()];
  const conversationId = conversation._id;
  for (const message of setUpMessages) {
    await conversations.addConversationMessage({
      conversationId,
      role: message.role,
      content: message.content,
    });
  }
  // Add user message + service response to conversation in DB.
  await request(app)
    .post(endpoint.replace(":conversationId", conversationId.toString()))
    .send({ message: (testMessage as TestCaseMessage).content })
    .set("X-Forwarded-For", ipAddress);

  // Read full conversation with added messages from the DB
  const fullConversation = await conversations.findById({
    _id: conversationId,
  });
  assert(fullConversation);
  const { messages: dbMessages } = fullConversation;
  const conversationTranscript = stringifyConversation(dbMessages);
  return conversationTranscript;
}
