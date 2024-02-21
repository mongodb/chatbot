import { ConversationGeneratedData } from "./GeneratedDataStore";
import { ConversationsService, ObjectId } from "mongodb-chatbot-server";
import { GenerateDataFunc } from "./GenerateDataFunc";
import { ConversationTestCase, SomeTestCase } from "./TestCase";
import request from "supertest";
import { Express } from "express";
import { strict as assert } from "assert";

export interface MakeGenerateConversationDataParams {
  /**
    Same `ConversationsService` instance used in the chatbot.
    The function uses the service to create conversations and add initial messages.
   */
  conversations: ConversationsService;

  /**
    Express.js HTTP server for the chatbot.
   */
  testApp: Express;

  /**
    URL for the endpoint to add a message to a conversation.
    The function replaces ":conversationId" with the actual conversation ID.
    @default "api/v1/conversations/:conversationId/messages"
  */
  addMessageToConversationEndpoint?: string;

  /**
    HTTP headers to include in the request to add a message to a conversation.
    @example
    ```json
    {
      "Authorization": "Bearer <some token>",
    }
    ```
  */
  addMessageToConversationHttpHeaders?: Record<string, string>;

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
  testApp,
  addMessageToConversationHttpHeaders = {},
  addMessageToConversationEndpoint = "/api/v1/conversations/:conversationId/messages",
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
    // FIXME: how to go away from this to something more elegant/typescripty?
    const convoTestCases = testCases as ConversationTestCase[];

    const generatedData: ConversationGeneratedData[] = [];
    const failedCases: ConversationTestCase[] = [];
    for await (const testCase of convoTestCases) {
      if (testCase.data.skip) {
        continue;
      }

      const { messages } = testCase.data;
      assert(messages.length > 0, "Must contain at least 1 message");
      const conversation = await conversations.create();

      const setUpMessages = messages.slice(0, -1); // All but the last message
      const testMessage = messages[messages.length - 1]; // Send last message to server

      assert(testMessage);
      const conversationId = conversation._id;
      for (const message of setUpMessages) {
        await conversations.addConversationMessage({
          conversationId,
          message,
        });
      }
      const endpointWithId = addMessageToConversationEndpoint.replace(
        ":conversationId",
        conversationId.toString()
      );

      const req = request(testApp).post(endpointWithId);
      for (const [key, value] of Object.entries(
        addMessageToConversationHttpHeaders
      )) {
        req.set(key, value);
      }
      // Add user message + service response to conversation in DB.
      const res = await req.send({ message: testMessage.content });
      if (res.status !== 200) {
        failedCases.push(testCase);
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
