import { stripIndents } from "common-tags";
import { checkResponseQuality } from "./checkResponseQuality";
import { CORE_ENV_VARS, assertEnvVars } from "mongodb-chatbot-server";

const {
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  OPENAI_CHAT_COMPLETION_MODEL_VERSION,
} = assertEnvVars(CORE_ENV_VARS);
/**
 *
 * @param received - The output from the LLM
 * @param expectedOutputDescription - A description of the expected output
 */
export async function meetsChatQualityStandards(
  received: string,
  expectedOutputDescription: any
) {
  const result = await checkResponseQuality(
    received,
    expectedOutputDescription,
    {
      apiKey: OPENAI_API_KEY,
      baseUrl: OPENAI_ENDPOINT,
      deployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
      version: OPENAI_CHAT_COMPLETION_MODEL_VERSION,
    }
  );

  if (!result.meetsChatQualityStandards) {
    return {
      pass: false,
      message: () =>
        stripIndents`Message did not meet quality standards.

      Received:
      ${received}

      Expected output: ${expectedOutputDescription}

      Reason: ${result?.reason}`,
    };
  } else {
    return {
      pass: true,
      message: () =>
        stripIndents`Message met quality standards.

      Received:
      ${received}

      Expected output: ${expectedOutputDescription}`,
    };
  }
}
