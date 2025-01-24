import { ObjectId } from "mongodb-rag-core/mongodb";
import { OpenAI } from "mongodb-rag-core/openai";
import {
  makeJudgeMongoDbChatbotCommentSentiment,
  Sentiment,
} from "./mongoDbChatbotCommentSentiment";
import { Message } from "mongodb-rag-core";

const reasoning = "foobar";
function makeMockOpenAi(sentiment: Sentiment["sentiment"]) {
  const mockOpenAiClient = {
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                tool_calls: [
                  {
                    function: {
                      arguments: JSON.stringify({
                        sentiment,
                        reasoning,
                      }),
                    },
                  },
                ],
              },
            },
          ],
        }),
      },
    },
  } as unknown as OpenAI;
  return mockOpenAiClient;
}

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

describe("mongoDbChatbotCommentSentiment", () => {
  it("should return positive sentiment score", async () => {
    const judgeMongoDbChatbotCommentSentiment =
      makeJudgeMongoDbChatbotCommentSentiment(makeMockOpenAi("positive"));
    const result = await judgeMongoDbChatbotCommentSentiment({
      judgeLlm: "gpt-4",
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
      makeJudgeMongoDbChatbotCommentSentiment(makeMockOpenAi("negative"));
    const result = await judgeMongoDbChatbotCommentSentiment({
      judgeLlm: "gpt-4",
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
      makeJudgeMongoDbChatbotCommentSentiment(makeMockOpenAi("neutral"));
    const result = await judgeMongoDbChatbotCommentSentiment({
      judgeLlm: "gpt-4",
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
    const judgeMongoDbChatbotCommentSentiment =
      makeJudgeMongoDbChatbotCommentSentiment(makeMockOpenAi("neutral"));
    expect(
      async () =>
        await judgeMongoDbChatbotCommentSentiment({
          judgeLlm: "gpt-4",
          messages,
          messageWithCommentId: new ObjectId(),
        })
    ).rejects.toThrow();
  });
});
