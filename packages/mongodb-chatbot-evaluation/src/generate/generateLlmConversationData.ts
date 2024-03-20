import { ConversationGeneratedData } from "./GeneratedDataStore";
import {
  ChatLlm,
  Conversation,
  Message,
  ObjectId,
  OpenAiChatMessage,
} from "mongodb-chatbot-server";
import { logger } from "mongodb-rag-core";
import { GenerateDataFunc } from "./GenerateDataFunc";
import {
  ConversationTestCase,
  SomeTestCase,
  isConversationTestCase,
} from "./TestCase";
import { strict as assert } from "assert";

export interface MakeGenerateLlmConversationDataParams {
  /**
    Any system message that you want to include in the conversation.
   */
  systemMessage?: string;

  /**
    The large language model to use for generating conversation data.
   */
  chatLlm: ChatLlm;

  /**
    Number of milliseconds to sleep between each conversation generation.
    Helpful for rate limiting.
   */
  sleepMs?: number;
}
/**
  Generate conversation data from test cases using a large language model,
  not an instance of the chatbot.

  This can be useful for evaluating how an LLM performs on a specific task,
  even before a RAG chatbot is implemented.
 */
export const makeGenerateLlmConversationData = function ({
  systemMessage,
  chatLlm,
  sleepMs = 0,
}: MakeGenerateLlmConversationDataParams): GenerateDataFunc {
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

    const generatedData: ConversationGeneratedData[] = [];
    const failedCases: ConversationTestCase[] = [];
    for (const testCase of convoTestCases) {
      logger.info(`Generating data for test case: '${testCase.data.name}'`);
      if (testCase.data.skip) {
        continue;
      }

      const messages = testCase.data
        .messages satisfies OpenAiChatMessage[] as OpenAiChatMessage[];

      assert(messages.length > 0, "Must contain at least 1 message");

      try {
        if (systemMessage !== undefined) {
          messages.unshift({
            content: systemMessage,
            role: "system",
          } satisfies OpenAiChatMessage);
        }

        const response = await chatLlm.answerQuestionAwaited({ messages });

        messages.push({
          content: response.content ?? "",
          role: "assistant",
        } satisfies OpenAiChatMessage);

        const fullConversation = {
          _id: new ObjectId(),
          createdAt: new Date(),
          messages: messages.map(openAiMessageToDbMessage),
          customData: {
            llmConversation: true,
          },
        } satisfies Conversation;

        generatedData.push({
          _id: new ObjectId(),
          commandRunId: runId,
          data: fullConversation,
          type: "conversation",
          evalData: {
            qualitativeFinalAssistantMessageExpectation:
              testCase.data.expectation,
            tags: testCase.data.tags,
            name: testCase.data.name,
          },
        });
      } catch (e) {
        logger.error(
          `Failed to generate data for test case: '${testCase.data.name}'`
        );
        failedCases.push(testCase);
      }
      await sleep(sleepMs);
    }

    return { generatedData, failedCases };
  };
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function openAiMessageToDbMessage(message: OpenAiChatMessage): Message {
  const dbMessage = {
    id: new ObjectId(),
    createdAt: new Date(),
    role: message.role,
    content: message.content ?? "",
  };
  if (message.role === "function" && message.name) {
    return { ...dbMessage, name: message.name };
  }
  return dbMessage as Message;
}
