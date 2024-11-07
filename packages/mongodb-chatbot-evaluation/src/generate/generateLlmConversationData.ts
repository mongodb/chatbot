import { ConversationGeneratedData } from "./GeneratedDataStore";
import {
  ChatLlm,
  Conversation,
  Message,
  OpenAiChatMessage,
} from "mongodb-chatbot-server";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { logger } from "mongodb-rag-core";
import { GenerateDataFunc } from "./GenerateDataFunc";
import {
  ConversationTestCase,
  SomeTestCase,
  isConversationTestCase,
} from "./TestCase";
import { strict as assert } from "assert";
import { sleep } from "../utils/sleep";
import { PromisePool } from "@supercharge/promise-pool";
import { backOff, BackoffOptions } from "exponential-backoff";

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

  /**
    Number of concurrent requests to make to the LLM.
   */
  concurrency?: number;

  /**
    Options for handling backoff on LLM called.
    Useful to combine with concurrency
    in case you hit a model rate limit.
   */
  backOffOptions?: BackoffOptions;
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
  concurrency = 5,
  backOffOptions = {
    jitter: "full",
    numOfAttempts: 5,
    startingDelay: 10000,
  },
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
    const convoTestCases = testCases
      .filter((testCase): testCase is ConversationTestCase =>
        isConversationTestCase(testCase)
      )
      .filter((testCase) => !testCase.data.skip);

    const failedCases: ConversationTestCase[] = [];
    const { results: generatedData } = await PromisePool.withConcurrency(
      concurrency
    )
      .for(convoTestCases)
      .handleError(async (error, testCase) => {
        logger.error({
          failedCase: `Failed to generate data for test case: '${testCase.data.name}'`,
          errorMessage: error,
        });
        failedCases.push(testCase);
      })
      .process(async (testCase: ConversationTestCase) => {
        logger.info(`Generating data for test case: '${testCase.data.name}'`);

        const messages = [
          ...(testCase.data
            .messages satisfies OpenAiChatMessage[] as OpenAiChatMessage[]),
        ];

        assert(messages.length > 0, "Must contain at least 1 message");

        if (systemMessage !== undefined) {
          messages.unshift({
            content: systemMessage,
            role: "system",
          } satisfies OpenAiChatMessage);
        }

        const response = await backOff(
          () => chatLlm.answerQuestionAwaited({ messages }),
          {
            ...backOffOptions,
            retry:
              backOffOptions.retry ??
              function (e, attemptNumber) {
                logger.error(
                  `Failed to call the LLM successfully. Attempt ${attemptNumber}/${backOffOptions.numOfAttempts}. Error: ${e}`
                );
                return true;
              },
          }
        );

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

        await sleep(sleepMs);
        return {
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
          createdAt: new Date(),
        } satisfies ConversationGeneratedData;
      });

    return { generatedData, failedCases };
  };
};

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
