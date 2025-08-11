import { ObjectId } from "mongodb-rag-core/mongodb";

import {
  makeJudgeMongoDbChatbotCommentSentiment,
  Sentiment,
} from "./mongoDbChatbotCommentSentiment";
import { Message } from "mongodb-rag-core";
import { MockLanguageModelV2 } from "mongodb-rag-core/aiSdk";

const reasoning = "foobar";

const userMessage = {
  id: new ObjectId(),
  role: "user",
  content: "How do I create an index?",
  createdAt: new Date(),
} satisfies Message;

const assistantMessage = {
  id: new ObjectId(),
  role: "assistant",
  content: "You can create an index using createIndex() method",
  createdAt: new Date(),
  userComment: "Love it",
  rating: true,
} satisfies Message;

const messages = [userMessage, assistantMessage];

const makeMockLanguageModel = (sentiment: Sentiment["sentiment"]) =>
  new MockLanguageModelV2({
    doGenerate: async () => {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              sentiment,
              reasoning,
            } satisfies Sentiment),
          },
        ],
        finishReason: "stop",
        usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
        warnings: [],
      };
    },
  });

describe("mongoDbChatbotCommentSentiment", () => {
  it("should return positive sentiment score", async () => {
    const judgeMongoDbChatbotCommentSentiment =
      makeJudgeMongoDbChatbotCommentSentiment(
        makeMockLanguageModel("positive")
      );
    const result = await judgeMongoDbChatbotCommentSentiment({
      messages,
      messageWithCommentId: messages[1].id,
    });

    expect(result?.score).toBe(1);
    expect(result.metadata).toEqual({
      sentiment: "positive",
      reasoning,
    });
  });

  it("should return negative sentiment score", async () => {
    const judgeMongoDbChatbotCommentSentiment =
      makeJudgeMongoDbChatbotCommentSentiment(
        makeMockLanguageModel("negative")
      );
    const result = await judgeMongoDbChatbotCommentSentiment({
      messages,
      messageWithCommentId: messages[1].id,
    });

    expect(result.score).toBe(0);
    expect(result.metadata).toEqual({
      sentiment: "negative",
      reasoning,
    });
  });

  it("should return neutral sentiment score", async () => {
    const judgeMongoDbChatbotCommentSentiment =
      makeJudgeMongoDbChatbotCommentSentiment(makeMockLanguageModel("neutral"));
    const result = await judgeMongoDbChatbotCommentSentiment({
      messages,
      messageWithCommentId: messages[1].id,
    });

    expect(result.score).toBe(0.5);
    expect(result.metadata).toEqual({
      sentiment: "neutral",
      reasoning,
    });
  });

  it("should throw error if no commented message for given ID", async () => {
    const neutralMockLanguageModel = new MockLanguageModelV2({
      doGenerate: jest.fn().mockResolvedValue({
        object: { sentiment: "neutral", reasoning },
      }),
    });
    const judgeMongoDbChatbotCommentSentiment =
      makeJudgeMongoDbChatbotCommentSentiment(neutralMockLanguageModel);
    expect(
      async () =>
        await judgeMongoDbChatbotCommentSentiment({
          messages,
          messageWithCommentId: new ObjectId(),
        })
    ).rejects.toThrow();
  });
});
