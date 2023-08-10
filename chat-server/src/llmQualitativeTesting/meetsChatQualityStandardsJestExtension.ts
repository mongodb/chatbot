import { stripIndents } from "common-tags";
import { checkResponseQuality } from "./checkResponseQuality";
import { CORE_ENV_VARS, assertEnvVars } from "chat-core";

const {
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_EMBEDDING_DEPLOYMENT,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
} = assertEnvVars(CORE_ENV_VARS);

/**
 *
 * @param received - The output from the LLM
 * @param expectedOutputDescription - A description of the expected output
 */
export async function meetsChatQualityStandards(
  received: string,
  expectedOutputDescription: string
) {
  const result = await checkResponseQuality(
    received,
    expectedOutputDescription,
    {
      apiKey: OPENAI_API_KEY,
      baseUrl: OPENAI_ENDPOINT,
      deployment: OPENAI_EMBEDDING_DEPLOYMENT,
      version: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
    }
  );

  if (!result.meetsChatQualityStandards) {
    return {
      pass: false,
      message: () =>
        stripIndents`Message did not meet quality standards.

      Received:
      ${JSON.stringify(received, null, 2)}
      Expected output: ${expectedOutputDescription}
      Reason: ${result?.reason}`,
    };
  } else {
    return {
      pass: true,
      message: () =>
        stripIndents`Message met quality standards.

      Received:
      ${JSON.stringify(received, null, 2)}
      Expected output: ${expectedOutputDescription}`,
    };
  }
}
