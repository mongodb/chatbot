import { logger } from "mongodb-rag-core";
// silence logger for tests
logger.transports.forEach((t) => (t.silent = true));
