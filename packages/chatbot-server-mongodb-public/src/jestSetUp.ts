import { logger } from "mongodb-chatbot-server";
import { addHeadersToHttpsRequests } from "./addHeadersToHttpRequests";
import "dotenv/config";
// silence logger for tests
logger.transports.forEach((t) => (t.silent = true));

beforeAll(() => {
  if (
    process.env.NODE_ENV === "test" &&
    process.env.AUTH_COOKIE !== undefined
  ) {
    console.log("we in");
    logger.info("Adding cookie to HTTPS requests since AUTH_COOKIE is set");
    addHeadersToHttpsRequests(
      new URL(process.env.OPENAI_ENDPOINT as string).hostname,
      {
        cookie: process.env.AUTH_COOKIE,
      }
    );
  }
});
