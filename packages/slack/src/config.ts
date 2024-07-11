import "dotenv/config";
import { z } from "zod";
import { generateErrorMessage } from "zod-error";

// Define a schema for environment variables
const EnvVars = z.object({
  SLACK_BOT_TOKEN: z.string(),
  SLACK_FEEDBACK_CHANNEL: z.string(),
  SLACK_SIGNING_SECRET: z.string(),
  SLACK_BOT_SERVER_PORT: z.number().default(3333),
  SLACK_WEBHOOK_SERVER_PORT: z.number().default(4444),
});

const parsedEnvVarsResult = EnvVars.safeParse(process.env);
if (!parsedEnvVarsResult.success) {
  const parseErrorMessage = generateErrorMessage(
    parsedEnvVarsResult.error.issues,
    {
      delimiter: {
        component: ", ",
        error: "\n  🚨",
      },
      prefix: "  🚨",
    }
  );
  const errorMessage = `Something is wrong in your environment configuration:\n${parseErrorMessage}`;
  throw new Error(errorMessage);
}

// Export a bag of all environment variables
export const { data: env } = parsedEnvVarsResult;

// Export individual named environment variables
export const {
  SLACK_BOT_TOKEN,
  SLACK_FEEDBACK_CHANNEL,
  SLACK_SIGNING_SECRET,
  SLACK_BOT_SERVER_PORT,
  SLACK_WEBHOOK_SERVER_PORT,
} = env;
