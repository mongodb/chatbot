import { logger } from "mongodb-chatbot-server";

// silence logger for tests
logger.transports.forEach((t) => (t.silent = true));

// Mock autoevals to avoid ESM parsing issues
jest.mock("autoevals", () => ({
  Faithfulness: jest.fn().mockImplementation(() => ({ score: 1 })),
  AnswerRelevancy: jest.fn().mockImplementation(() => ({ score: 1 })),
  ContextRelevancy: jest.fn().mockImplementation(() => ({ score: 1 })),
}));
