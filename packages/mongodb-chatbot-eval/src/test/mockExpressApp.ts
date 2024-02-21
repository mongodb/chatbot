import {
  ConversationsService,
  Message,
  ObjectId,
} from "mongodb-chatbot-server";
import express from "express";

export const TRIGGER_SERVER_ERROR_MESSAGE = "THROW_ON_ME";

export const newMessage: Message = {
  content: "Hola",
  role: "assistant",
  createdAt: new Date(),
  id: new ObjectId(),
};

export const makeMockExpressApp = (conversations: ConversationsService) => {
  const app = express();
  app.use(express.json());
  app.post("/api/v1/conversations/:conversationId/messages", (req, res) => {
    if (req.body.message === TRIGGER_SERVER_ERROR_MESSAGE) {
      return res.status(500).send("Internal Server Error");
    }
    const conversationId = ObjectId.createFromHexString(
      req.params.conversationId
    );
    const userMessage = {
      content: req.body.message,
      role: "user",
      createdAt: new Date(),
      id: new ObjectId(),
    } satisfies Message;
    conversations.addConversationMessage({
      conversationId: conversationId,
      message: userMessage,
    });
    conversations.addConversationMessage({
      conversationId: conversationId,
      message: newMessage,
    });
    return res.send(newMessage);
  });
  return app;
};
