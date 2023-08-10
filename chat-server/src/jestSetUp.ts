import { logger } from "chat-core";
import { meetsChatQualityStandards } from "./llmQualitativeTesting/meetsChatQualityStandardsJestExtension";
// silence logger for tests
logger.transports.forEach((t) => (t.silent = true));

// expect.extend({
//   meetsChatQualityStandards,
// });
