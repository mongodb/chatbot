import { logger } from "chat-core";
import { AzureKeyCredential, OpenAIClient } from "@azure/openai";
import { stripIndent, stripIndents } from "common-tags";
import { ApiConversation } from "./routes/conversations/utils";
// silence logger for tests
logger.transports.forEach((t) => (t.silent = true));

expect.extend({
  /**
   *
   * @param received - The output from the LLM
   * @param expectedOutputDescription - A description of the expected output
   */
  async meetsChatQualityStandards(
    received: ApiConversation,
    expectedOutputDescription: string
  ) {
    const result = await getDidResponseMeetChatQualityStandards(
      received,
      expectedOutputDescription
    );

    if (!result.meetsChatQualityStandards) {
      return {
        pass: false,
        message: () =>
          stripIndents`Message did not meet chat quality standards.

        Received:
        ${JSON.stringify(received, null, 2)}
        Expected output: ${expectedOutputDescription}
        Reason: ${result?.reason}`,
      };
    } else {
      return {
        pass: true,
        message: () =>
          stripIndents`Message met chat quality standards.

        Received:
        ${JSON.stringify(received, null, 2)}
        Expected output: ${expectedOutputDescription}`,
      };
    }
  },
});

export interface ChatQualityStandardsResponse {
  /** Whether the response meets chat quality standards. */
  meetsChatQualityStandards: boolean;
  /** The reason the response does not meet chat quality standards. */
  reason?: string;
}
export async function getDidResponseMeetChatQualityStandards(
  received: ApiConversation,
  expectedOutputDescription: string
): Promise<ChatQualityStandardsResponse> {
  // TODO: use typechat?
  const credential = new AzureKeyCredential("foo");
  const openai = new OpenAIClient("endpoint", credential, {
    apiVersion: "foo",
  });
  // TODO:
  // 1. convert ApiConversation to a string
  // 2. send to LLM with a prompt about assessing the quality of the response
  // 3. return the result

  return {
    meetsChatQualityStandards: true,
    reason: "foo bar",
  };
}
