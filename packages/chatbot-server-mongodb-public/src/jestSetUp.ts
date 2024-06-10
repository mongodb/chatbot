import { logger } from "mongodb-chatbot-server";
import "dotenv/config";
// silence logger for tests
logger.transports.forEach((t) => (t.silent = true));
