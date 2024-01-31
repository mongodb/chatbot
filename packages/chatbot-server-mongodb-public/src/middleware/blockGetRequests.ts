import { ConversationsMiddleware } from "mongodb-chatbot-server";

export const blockGetRequests: ConversationsMiddleware = (req, res, next) => {
  if (req.method === "GET") {
    return res.status(404).json({
      message: "Route not found",
    });
  } else {
    next();
  }
};
