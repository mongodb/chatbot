import { logger } from "mongodb-chatbot-server";

// silence logger for tests
logger.transports.forEach((t) => (t.silent = true));
