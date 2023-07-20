import { logger } from "chat-core";
// silence logger for tests
logger.transports.forEach((t) => (t.silent = true));
