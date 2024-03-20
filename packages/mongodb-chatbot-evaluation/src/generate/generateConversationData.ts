import { ConversationGeneratedData } from "./GeneratedDataStore";
import { ConversationsService, ObjectId } from "mongodb-chatbot-server";
import { logger } from "mongodb-rag-core";
import { GenerateDataFunc } from "./GenerateDataFunc";
import {
  ConversationTestCase,
  SomeTestCase,
  isConversationTestCase,
} from "./TestCase";
import { strict as assert } from "assert";
import axios from "axios";

export interface MakeGenerateConversationDataParams {
  /**
    Same `ConversationsService` instance used in the chatbot.
    The function uses the service to create conversations and add initial messages.
   */
  conversations: ConversationsService;

  /**
    URL for the server you're evaluating.
    @default "http://localhost:3000/api/v1/"
  */
  apiBaseUrl?: string;

  /**
    HTTP headers to include in the request to add a message to a conversation.
    @example
    ```json
    {
      "Authorization": "Bearer <some token>",
    }
    ```
  */
  httpHeaders?: Record<string, string>;

  /**
    Number of milliseconds to sleep between each conversation.
    This can be useful if there's a rate limit on some components of the chatbot.
    Often LLM APIs have a rate limit, for example.
    @default 0
   */
  sleepMs?: number;
}
/**
  Generate conversation data from test cases.
 */
export const makeGenerateConversationData = function ({
  conversations,
  httpHeaders = {},
  apiBaseUrl = "http://localhost:3000/api/v1/",
  sleepMs = 0,
}: MakeGenerateConversationDataParams): GenerateDataFunc {
  return async function ({
    testCases,
    runId,
  }: {
    testCases: SomeTestCase[];
    runId: ObjectId;
  }): Promise<{
    generatedData: ConversationGeneratedData[];
    failedCases: ConversationTestCase[];
  }> {
    const convoTestCases = testCases.filter(
      (testCase): testCase is ConversationTestCase =>
        isConversationTestCase(testCase)
    );

    apiBaseUrl = apiBaseUrl.replace(/\/$/, ""); // remove trailing slash if it exists

    const generatedData: ConversationGeneratedData[] = [];
    const failedCases: ConversationTestCase[] = [];
    for (const testCase of convoTestCases) {
      logger.info(`Generating data for test case: '${testCase.data.name}'`);
      if (testCase.data.skip) {
        continue;
      }

      const { messages } = testCase.data;
      assert(messages.length > 0, "Must contain at least 1 message");
      const createRes = await axios.post(
        `${apiBaseUrl}/conversations`,
        {},
        {
          headers: httpHeaders,
          validateStatus: () => true, // don't throw on non-200 status
        }
      );
      if (createRes.status !== 200) {
        failedCases.push(testCase);
        continue;
      }
      const conversation = await conversations.findById({
        _id: ObjectId.createFromHexString(createRes.data._id),
      });
      assert(conversation, "Conversation must exist");

      const setUpMessages = messages.slice(0, -1); // All but the last message
      const testMessage = messages[messages.length - 1]; // Send last message to server

      assert(
        testMessage,
        "Conversation must include at least one message to test"
      );
      const conversationId = conversation._id;
      for (const message of setUpMessages) {
        await conversations.addConversationMessage({
          conversationId,
          message,
        });
      }
      const addMessageToConversationEndpoint = `${apiBaseUrl}/conversations/${conversationId}/messages`;

      const res = await axios.post(
        addMessageToConversationEndpoint,
        {
          message: testMessage.content,
        },
        {
          headers: httpHeaders,
          validateStatus: () => true, // don't throw on non-200 status
        }
      );

      if (res.status !== 200) {
        failedCases.push(testCase);
        continue;
      }

      // Read full conversation with added messages from the DB
      const fullConversation = await conversations.findById({
        _id: conversationId,
      });
      assert(fullConversation);
      generatedData.push({
        _id: conversationId,
        commandRunId: runId,
        data: fullConversation,
        type: "conversation",
        evalData: {
          qualitativeFinalAssistantMessageExpectation:
            testCase.data.expectation,
          tags: testCase.data.tags,
          name: testCase.data.name,
          expectedLinks: testCase.data.expectedLinks,
        },
      });
      await sleep(sleepMs);
    }

    return { generatedData, failedCases };
  };
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
