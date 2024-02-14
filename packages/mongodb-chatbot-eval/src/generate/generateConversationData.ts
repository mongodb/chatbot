import { GeneratedData } from "./GeneratedDataStore";
import { Conversation, ConversationsService } from "mongodb-chatbot-server";
import { GenerateDataFunc } from "./GenerateDataFunc";
import { ConversationTestCase } from "./TestCase";
import request from "supertest";
import { Express } from "express";
import { strict as assert } from "assert";

export interface ConversationGeneratedData extends GeneratedData {
  type: "conversation";
  data: Conversation;
  evalData: ConversationEvalData;
}

export interface ConversationEvalData extends Record<string, unknown> {
  /**
    Arbitrary metadata about the conversation.
   */
  tags?: string[];
  /**
    Description of what you want to see from the final assistant message.
   */
  qualitativeFinalAssistantMessageExpectation: string;
}

export interface MakeGenerateConversationDataParams {
  conversations: ConversationsService;
  testApp: Express;
  // TODO: not sure if this quite right...should it be automatic? or at least a default value
  endpoint: string;
}
/**
  Generate conversation data from test cases.
 */
export const makeGenerateConversationData = function ({
  conversations,
  testApp,
  endpoint,
}: MakeGenerateConversationDataParams): GenerateDataFunc<
  ConversationTestCase,
  ConversationGeneratedData
> {
  return async function ({ testCases, runId }) {
    const generatedData: ConversationGeneratedData[] = [];
    for await (const testCase of testCases) {
      if (testCase.data.skip) {
        continue;
      }

      const { messages } = testCase.data;
      const conversation = await conversations.create();
      const [setUpMessages, testMessage] = [
        messages.slice(0, -1),
        messages.pop(),
      ];
      assert(testMessage);
      const conversationId = conversation._id;
      for (const message of setUpMessages) {
        await conversations.addConversationMessage({
          conversationId,
          message,
        });
      }
      const endpointWithId = endpoint.replace(
        ":conversationId",
        conversationId.toString()
      );

      // Add user message + service response to conversation in DB.
      const res = await request(testApp)
        .post(endpointWithId)
        .send({ message: testMessage.content });
      if (res.status !== 200) {
        throw new Error(
          `Failed to add message to conversation: ${JSON.stringify(
            res.body
          )}, ${res.status}`
        );
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
    }

    return generatedData;
  };
};
